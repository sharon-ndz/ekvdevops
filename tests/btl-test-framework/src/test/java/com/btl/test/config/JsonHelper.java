package com.btl.test.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Map;
//import java.util.regex.Matcher;
//import java.util.regex.Pattern;

public class JsonHelper {

    private static final ObjectMapper mapper = new ObjectMapper();

    private static final ObjectMapper objectMapper = new ObjectMapper();
    public static JsonNode readJsonFromFile(Path path) throws IOException {
        if (path == null || !Files.exists(path)) {
            String msg = "❌️ File not found: " + (path != null ? path.toAbsolutePath() : "null");
            System.err.println(msg);
            throw new FileNotFoundException(msg);
        }

        try {
            return objectMapper.readTree(path.toFile());
        } catch (IOException e) {
            String msg = "❌ Failed to read JSON from file: " + path.toAbsolutePath();
            System.err.println(msg);
            throw new IOException(msg, e);
        }
    }

    /**
     * Returns all field names of a JSON object node.
     */
    public static Iterable<String> fieldNames(JsonNode node) {
        if (node == null || !node.isObject()) return () -> new Iterator<String>() {
            @Override public boolean hasNext() { return false; }
            @Override public String next() { return null; }
        };

        return () -> node.fieldNames();
    }

    /**
     * Loads a JSON file from classpath and returns as JsonNode.
     */
    public static JsonNode loadJsonFromResource(String path) {
        try (InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream(path)) {
            if (is == null) throw new RuntimeException("Resource not found: " + path);
            return mapper.readTree(is);
        } catch (Exception e) {
            System.err.println("❌ ERROR:"+"Failed to load JSON from: " + path);
            throw new RuntimeException("Failed to load JSON from: " + path, e);
        }
    }

    /**
     * Resolves placeholders inside a JsonNode (recursively),
     * replacing string values with placeholders (e.g. ${randomString:8}).
     * Returns a new JsonNode with all placeholders replaced.
     */
    public static JsonNode resolvePlaceholdersInNode(JsonNode node, Map<String,String> context) {
        if (node == null) return null;

        if (node.isObject()) {
            ObjectNode result = mapper.createObjectNode();
            node.fields().forEachRemaining(entry -> {
                result.set(entry.getKey(), resolvePlaceholdersInNode(entry.getValue(), context));
            });
            return result;
        }

        if (node.isArray()) {
            var arr = mapper.createArrayNode();
            node.forEach(element -> arr.add(resolvePlaceholdersInNode(element, context)));
            return arr;
        }

        if (node.isTextual()) {
            String resolved = PlaceholderResolver.resolve(node.asText(), context);
            return mapper.convertValue(resolved, JsonNode.class);
        }

        // For other node types (number, boolean, null) just return as is
        return node;
    }
}
