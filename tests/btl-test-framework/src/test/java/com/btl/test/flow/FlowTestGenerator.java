package com.btl.test.flow;

import com.btl.test.config.ConfigLoader;
import com.btl.test.config.JsonHelper;
import com.btl.test.context.ContextManager;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DynamicTest;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

public class FlowTestGenerator {

    private final FlowExecutor flowExecutor = new FlowExecutor();

    /**
     * Discovers and generates dynamic tests for all configured flows.
     */
    public Stream<DynamicTest> generateAllTests() throws Exception {

        Path flowsBasePath = Paths.get(Objects.requireNonNull(
                getClass().getClassLoader().getResource("configs/flows")
        ).toURI());

        List<DynamicTest> allTests = new ArrayList<>();

        List<Path> indexFiles = ConfigLoader.discoverFlowIndexFiles(flowsBasePath.toString());

        for (Path indexPath : indexFiles) {
            Path flowDir = indexPath.getParent();
            String flowName = flowDir.getFileName().toString();

            // Step 1: Load list of endpoint files from index.json
            List<String> endpointFiles = ConfigLoader.loadEndpointFileList(indexPath);

            // **Create ContextManager here for this flow**
            ContextManager context = new ContextManager();

            for (String fileRef : endpointFiles) {
                Path resolvedPath = flowDir.resolve(fileRef).normalize();

                JsonNode rootNode;
                try {
                    rootNode = JsonHelper.readJsonFromFile(resolvedPath);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to read step file: " + fileRef, e);
                }

                // Step 2: Extract metadata and steps from each endpoint JSON
                JsonNode metadata = rootNode.get("metadata");
                JsonNode stepsNode = rootNode.get("steps");

                if (stepsNode == null || !stepsNode.isArray()) {
                    throw new IllegalStateException("'steps' missing or invalid in: " + fileRef);
                }

                List<JsonNode> steps = new ArrayList<>();
                stepsNode.forEach(steps::add);

                // Step 3: Pass flow name, fileRef, metadata and steps to FlowExecutor
                List<DynamicTest> flowTests = flowExecutor.executeFlow(flowName, fileRef, metadata, steps,context);
                allTests.addAll(flowTests);
            }
            context.clear();
        }

        return allTests.stream();
    }

}
