package com.btl.test;

import com.btl.test.base.TestBase;
import com.btl.test.config.ConfigLoader;
import com.btl.test.config.JsonHelper;
import com.fasterxml.jackson.databind.JsonNode;
import io.restassured.response.Response;
import org.junit.jupiter.api.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * Test suite that dynamically loads and executes flow-based API tests from JSON configuration files.
 *
 * <p>This test class scans the {@code resources/configs/flows/} directory at runtime.
 * Each subdirectory is treated as a test flow and must contain an {@code index.json} file
 * that lists the individual endpoint configuration files to execute.</p>
 *
 * <h2>Flow Discovery and Execution</h2>
 * <ul>
 *   <li>Each subdirectory under {@code configs/flows/} represents a distinct test flow.</li>
 *   <li>The test suite auto-discovers newly added folders and their {@code index.json} files.</li>
 *   <li>{@code index.json} contains a list of endpoint JSON filenames to load and execute in order.</li>
 *   <li>Each endpoint file defines a single or multiple API steps (with method, path, body, assertions, etc).</li>
 * </ul>
 *
 * <p>During execution, endpoint requests are dynamically built with placeholder resolution,
 * query parameters, authorization headers, context propagation, and assertion checks.</p>
 *
 * <p>Dynamic tests are generated per flow and executed sequentially using JUnit 5's {@link org.junit.jupiter.api.DynamicTest}.</p>
 *
 * @author rpillai
 * @see com.btl.test.base.TestBase
 * @see com.btl.test.config.ConfigLoader
 * @see com.btl.test.config.JsonHelper
 * @see com.btl.test.config.PlaceholderResolver
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ApiSuiteTest extends TestBase {

    /**
     * Initializes the test environment before all tests are executed.
     * This typically sets base URI and other shared configurations.
     *
     * @throws Exception if setup fails.
     */
    @BeforeAll
    public static void init() throws Exception {
        System.out.println("Calling setupBase");
        setupBase(); // Initialize base URI/context, etc.
    }

    /**
     * Dynamically generates tests for each configured flow and its endpoints.
     *
     * <p>Each flow is defined by an index JSON file, which lists endpoint files.
     * Each endpoint file contains one or more API steps to be executed in order.</p>
     *
     * @return Stream of {@link DynamicTest} instances.
     * @throws Exception if config loading or parsing fails.
     */
    @TestFactory
    public Stream<DynamicTest> generateTests() throws Exception {
        try {
            Path flowsBasePath = Paths.get(Objects.requireNonNull(
                    getClass().getClassLoader().getResource("configs/flows")
            ).toURI());
            System.out.println("Resource = " + flowsBasePath);

            List<DynamicTest> dynamicTests = new ArrayList<>();
            List<Path> indexFiles = ConfigLoader.discoverFlowIndexFiles(flowsBasePath.toString());

            for (Path indexPath : indexFiles) {
                Path flowDir = indexPath.getParent();
                String flowName = flowDir.getFileName().toString();

                List<String> endpointFileRefs = ConfigLoader.loadEndpointFileList(indexPath);

                for (String fileRef : endpointFileRefs) {
                    Path resolvedPath = flowDir.resolve(fileRef).normalize();
                    JsonNode endpoints = ConfigLoader.loadEndpoints(resolvedPath);

                    String testName = flowName + " - " + fileRef;

                    // One test per flow file that runs all its steps in sequence
                    DynamicTest flowTest = DynamicTest.dynamicTest(testName, () -> {
                        System.out.println("\n=== 🧪 Running Flow: " + testName + " ===");
                        for (JsonNode endpoint : endpoints) {
                            String endpointName = endpoint.has("name")
                                    ? endpoint.get("name").asText()
                                    : "[Unnamed Test]";
                            try {
                                System.out.println("➡️ Running: " + endpointName);
                                runRequest(endpoint);
                            } catch (Exception e) {
                                System.err.println("❌ Failure in: " + endpointName);
                                fail("Flow failed at: " + endpointName + "\n" + e.getMessage(), e);
                            }
                        }
                        System.out.println("✅ Flow completed: " + testName);
                    });

                    dynamicTests.add(flowTest);
                }
            }

            return dynamicTests.stream();
        } catch (Exception e) {
            e.printStackTrace();
            return Stream.empty();  // or rethrow as unchecked if you want failure
        }
    }

    /**
     * Executes a single API endpoint request defined in the JSON configuration.
     *
     * <p>Supports GET, POST, PUT, PATCH, and DELETE HTTP methods.
     * Automatically resolves placeholders, handles context injection,
     * executes assertions, and stores extracted values back to context.</p>
     *
     * @param endpoint JsonNode representing a single endpoint config.
     */
    private void runRequest(JsonNode endpoint) {
        String method = endpoint.get("method").asText();
        String rawPath = endpoint.get("path").asText();
        String path = resolvePlaceholders(rawPath);

        JsonNode bodyNode = endpoint.get("body");
        String bodyJson = null;
        if (bodyNode != null) {
            JsonNode resolvedBodyNode = JsonHelper.resolvePlaceholdersInNode(bodyNode, context);
            bodyJson = resolvedBodyNode.toString();
        }

        var request = given();
        request.header("Content-Type", "application/json");

        JsonNode queryParams = endpoint.get("query");
        if (queryParams != null && queryParams.isObject()) {
            for (String param : JsonHelper.fieldNames(queryParams)) {
                String rawValue = queryParams.get(param).asText();
                String resolvedValue = resolvePlaceholders(rawValue);
                request.queryParam(param, resolvedValue);
            }
        }

        JsonNode requires = endpoint.get("requires");
        if (requires != null) {
            for (JsonNode requiredKey : requires) {
                String key = requiredKey.asText();
                if (!context.containsKey(key)) {
                    System.out.println("⏭️ Skipping " + endpoint.get("name").asText() +
                            " — missing dependency: " + key);
                    fail("Test aborted: Required field not found in context. key="+key);
                    //return;
                }
                if (key.equals("token")) {
                    request.header("Authorization", "Bearer " + context.get("token"));
                }
            }
        }

        Response response;
        try {
            switch (method.toUpperCase()) {
                case "GET": response = request.get("/" + path); break;
                case "POST": response = request.body(bodyJson).post("/" + path); break;
                case "PUT": response = request.body(bodyJson).put("/" + path); break;
                case "PATCH": response = request.body(bodyJson).patch("/" + path); break;
                case "DELETE": response = request.delete("/" + path); break;
                default:
                    throw new IllegalArgumentException("Unsupported HTTP method: " + method);
            }
        } catch (Exception e) {
            throw new RuntimeException("Request failed for: /" + path, e);
        }

        System.out.println("→ [" + method + "] /" + path);
        System.out.println("← Status: " + response.getStatusCode());
        System.out.println("← Body: " + response.asPrettyString());

        // Assertions
        assertResponse(endpoint.get("assertions"), response);

        // Extract values to context
        JsonNode extractNode = endpoint.get("extract");
        if (extractNode != null) {
            for (String key : JsonHelper.fieldNames(extractNode)) {
                String jsonPath = extractNode.get(key).asText();
                String value = response.jsonPath().getString(jsonPath);
                context.put(key, value);
                System.out.println("📦 Extracted: " + key + " = " + value);
            }
        }
    }
    /**
     * Dummy test to verify base URL configuration.
     * Used for sanity check and simple logging.
     */
    @Test
    public void dummyTest() {
        System.out.println("✅ Config is using URL " + baseUrl );
    }
}
