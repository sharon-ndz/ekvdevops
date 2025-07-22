package com.btl.test.config;

import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 * Utility class for loading and discovering API flow configurations.
 *
 * <p>This class handles discovery of flow directories containing an {@code index.json} file,
 * loading the list of endpoint test files from the index file, and reading the JSON
 * definitions of API test flows.</p>
 *
 * <p>Flows are organized in directories under a base {@code flows} folder. Each flow folder
 * must contain an {@code index.json} file listing all JSON endpoint files in that flow.</p>
 *
 * <h2>Responsibilities</h2>
 * <ul>
 *   <li>Discover flow directories with {@code index.json} files</li>
 *   <li>Parse index files to retrieve ordered lists of endpoint JSON files</li>
 *   <li>Load endpoint JSON definitions from file paths</li>
 * </ul>
 *
 * @author rpillai
 * @see com.btl.test.config.JsonHelper
 */
public class ConfigLoader {

    /**
     * Discovers all flow directories that contain an {@code index.json} file within the
     * specified base directory.
     *
     * <p>Each flow directory is expected to be a subdirectory of {@code flowsBaseDir}.
     * Only directories with an {@code index.json} file are included.</p>
     *
     * @param flowsBaseDir the base directory under which flow folders reside
     * @return a list of paths to {@code index.json} files discovered in flow directories
     * @throws IOException if an I/O error occurs accessing the filesystem
     */
    public static List<Path> discoverFlowIndexFiles(String flowsBaseDir) throws IOException {
        List<Path> indexFiles = new ArrayList<>();

        try (Stream<Path> stream = Files.list(Paths.get(flowsBaseDir))) {
            stream
                    .filter(Files::isDirectory)
                    .forEach(flowDir -> {
                        Path indexFile = flowDir.resolve("index.json");
                        if (Files.exists(indexFile)) {
                            indexFiles.add(indexFile);
                        }
                    });
        }

        return indexFiles;
    }

    /**
     * Loads the list of endpoint test JSON files referenced in a flow's {@code index.json}.
     *
     * <p>The index file is expected to be a JSON array of string filenames.</p>
     *
     * @param indexPath the path to the {@code index.json} file
     * @return a list of endpoint JSON filenames listed in the index file
     * @throws IOException if reading or parsing the index file fails
     */
    public static List<String> loadEndpointFileList(Path indexPath) throws IOException {
        JsonNode indexNode = JsonHelper.readJsonFromFile(indexPath);
        List<String> fileList = new ArrayList<>();
        for (JsonNode fileNode : indexNode) {
            fileList.add(fileNode.asText());
        }
        return fileList;
    }

    /**
     * Loads the JSON array of steps (test cases) defined in the specified test file.
     *
     * <p>The file root is expected to be a JSON object with "metadata" and "steps" keys,
     * where "steps" is an array of API call definitions.</p>
     *
     * @param fullFilePath the full path to the endpoint JSON file
     * @return the JSON array node representing the steps of the test flow
     * @throws IOException if reading, parsing, or structure validation fails
     */
    public static JsonNode loadEndpoints(Path fullFilePath) throws IOException {
        JsonNode root = JsonHelper.readJsonFromFile(fullFilePath);

        // Optional: retrieve metadata if needed
        JsonNode metadata = root.get("metadata");
        if (metadata != null) {
            // You can use metadata if required by your app logic
        }

        JsonNode steps = root.get("steps");
        if (steps == null || !steps.isArray()) {
            throw new IOException("Expected 'steps' array missing or invalid in file: " + fullFilePath);
        }

        return steps;
    }
}
