package com.btl.test.flow;

import com.btl.test.config.ConfigLoader;
import com.btl.test.config.JsonHelper;
import com.btl.test.context.ContextManager;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DynamicTest;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public class FlowTestGenerator {
    private static final String FLOWS_CONFIG_PATH = "configs/flows";
    private final FlowExecutor flowExecutor = new FlowExecutor();

    /**
     * Discovers and generates dynamic tests for all configured flows.
     */
    public Stream<DynamicTest> generateAllTests() throws IOException, URISyntaxException {
        Path flowsBasePath = resolveConfigPath(FLOWS_CONFIG_PATH);
        List<DynamicTest> allTests = new ArrayList<>();

        for (Path indexPath : ConfigLoader.discoverFlowIndexFiles(flowsBasePath.toString())) {
            processFlowIndex(indexPath, allTests);
        }

        return allTests.stream();
    }

    private Path resolveConfigPath(String configPath) throws URISyntaxException {
        URL resourceUrl = getClass().getClassLoader().getResource(configPath);
        if (resourceUrl == null) {
            throw new IllegalStateException("Configuration directory not found: " + configPath);
        }
        return Paths.get(resourceUrl.toURI());
    }

    private void processFlowIndex(Path indexPath, List<DynamicTest> allTests) throws IOException {
        Path flowDir = indexPath.getParent();
        Path variablesPath = flowDir.resolve("variables.json");
        String flowName = flowDir.getFileName().toString();
        List<String> endpointFiles = ConfigLoader.loadEndpointFileList(indexPath);

        ContextManager context = new ContextManager();

        if (Files.exists(variablesPath)) {
            // Load the variables file
            JsonNode variablesNode = JsonHelper.readJsonFromFile(variablesPath);

            // First pass: resolve any placeholders in the variables using current context
            JsonNode resolvedVariables = JsonHelper.resolvePlaceholdersInNode(
                    variablesNode,
                    context.getAll()
            );

            // Add the resolved variables to the context as key/value pairs
            if (resolvedVariables.isObject()) {
                resolvedVariables.fields().forEachRemaining(entry -> {
                    String key = entry.getKey();
                    String value = entry.getValue().asText();
                    context.put(key, value);
                });
            }

        }




        try {

            for (String fileRef : endpointFiles) {
                processEndpointFile(flowDir, flowName, fileRef, context, allTests);
            }
        } finally {
            try {
                context.close();
            } catch (Exception e) {
                throw new RuntimeException("Failed to close context for flow: " + flowName, e);
            }
        }
    }


    private void processEndpointFile(Path flowDir, String flowName, String fileRef,
                                     ContextManager context, List<DynamicTest> allTests) throws IOException {
        Path resolvedPath = flowDir.resolve(fileRef).normalize();
        JsonNode rootNode = JsonHelper.readJsonFromFile(resolvedPath);

        JsonNode metadata = rootNode.get("metadata");
        JsonNode stepsNode = rootNode.get("steps");

        validateStepsNode(stepsNode, fileRef);

        List<JsonNode> steps = new ArrayList<>();
        stepsNode.forEach(steps::add);

        List<DynamicTest> flowTests = flowExecutor.executeFlow(flowName, fileRef, metadata, steps, context);
        allTests.addAll(flowTests);
    }

    private void validateStepsNode(JsonNode stepsNode, String fileRef) {
        if (stepsNode == null || !stepsNode.isArray()) {
            throw new IllegalStateException("'steps' missing or invalid in: " + fileRef);
        }
    }
}