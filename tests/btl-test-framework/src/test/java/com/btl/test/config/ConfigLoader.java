package com.btl.test.config;

import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Stream;

public class ConfigLoader {

    // Discover all flow folders that have index.json
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

    // Load list of test files from index.json
    public static List<String> loadEndpointFileList(Path indexPath) throws IOException {
        JsonNode indexNode = JsonHelper.readJsonFromFile(indexPath);
        List<String> fileList = new ArrayList<>();
        for (JsonNode fileNode : indexNode) {
            fileList.add(fileNode.asText());
        }
        return fileList;
    }

    // Load test JSON file from a given full path
    public static JsonNode loadEndpoints(Path fullFilePath) throws IOException {
        return JsonHelper.readJsonFromFile(fullFilePath);
    }
}
