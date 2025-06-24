package com.btl.test.idlms.tests;

import com.btl.test.base.TestBase;
import com.btl.test.config.ConfigLoader;
import com.btl.test.config.JsonHelper;
import com.fasterxml.jackson.databind.JsonNode;
import io.restassured.response.Response;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.fail;

public class ApiTestSuite extends TestBase {

    @BeforeAll
    public static void init() throws Exception {
        setupBase();
    }

    @TestFactory
    public Collection<DynamicTest> generateTests() throws Exception {
        //String flowsBaseDir = "src/test/resources/flows";
        Path flowsBasePath = Paths.get(Objects.requireNonNull(
                getClass().getClassLoader().getResource("configs/flows")
        ).toURI());
        List<DynamicTest> dynamicTests = new ArrayList<>();

        //List<Path> indexFiles = ConfigLoader.discoverFlowIndexFiles(flowsBaseDir);
        List<Path> indexFiles = ConfigLoader.discoverFlowIndexFiles(flowsBasePath.toString());

        for (Path indexPath : indexFiles) {
            Path flowDir = indexPath.getParent();
            String flowName = flowDir.getFileName().toString();

            List<String> endpointFileRefs = ConfigLoader.loadEndpointFileList(indexPath);

            for (String fileRef : endpointFileRefs) {
                Path resolvedPath = flowDir.resolve(fileRef).normalize();

                JsonNode endpoints = ConfigLoader.loadEndpoints(resolvedPath);

                for (JsonNode endpoint : endpoints) {
                    String testName = flowName + " - " + fileRef + " - " +
                            (endpoint.has("name") ? endpoint.get("name").asText() : "[Unnamed Test]");

                    DynamicTest test = DynamicTest.dynamicTest(testName, () -> {
                        try {
                            runRequest(endpoint);
                        } catch (Exception e) {
                            fail("Test failed: " + testName + "\n" + e.getMessage(), e);
                        }
                    });

                    dynamicTests.add(test);
                }
            }
        }

        return dynamicTests;
    }

    // runRequest unchanged from your existing logic
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
                    System.out.println("Skipping " + endpoint.get("name").asText() +
                            " — missing dependency: " + key);
                    return;
                }
                if (key.equals("token")) {
                    request.header("Authorization", "Bearer " + context.get("token"));
                }
            }
        }

        Response response;
        try {
            switch (method.toUpperCase()) {
                case "GET":
                    response = request.get("/" + path);
                    break;
                case "POST":
                    response = request.body(bodyJson).post("/" + path);
                    break;
                case "PUT":
                    response = request.body(bodyJson).put("/" + path);
                    break;
                case "PATCH":
                    response = request.body(bodyJson).patch("/" + path);
                    break;
                case "DELETE":
                    response = request.delete("/" + path);
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported HTTP method: " + method);
            }
        } catch (Exception e) {
            throw new RuntimeException("Request failed for: " + path, e);
        }

        System.out.println("→ [" + method + "] /" + path);
        System.out.println("← Status: " + response.getStatusCode());
        System.out.println("← Body: " + response.asPrettyString());

        assertResponse(endpoint.get("assertions"), response);

        JsonNode extractNode = endpoint.get("extract");
        if (extractNode != null) {
            for (String key : JsonHelper.fieldNames(extractNode)) {
                String jsonPath = extractNode.get(key).asText();
                String value = response.jsonPath().getString(jsonPath);
                context.put(key, value);
            }
        }
    }
}
