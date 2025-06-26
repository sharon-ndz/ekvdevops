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
/**
 * Utility class for common JSON operations such as reading JSON from files or resources,
 * enumerating JSON object fields, and resolving placeholders inside JSON nodes.
 *
 * <p>This class leverages Jackson's {@link ObjectMapper} for JSON parsing and
 * provides helper methods for test configuration processing.</p>
 *
 * <p>It supports recursive placeholder resolution in JSON nodes, replacing
 * string placeholders like {@code ${randomString:8}} with actual runtime values.</p>
 *
 * @author rpillai
 * @see com.btl.test.config.PlaceholderResolver
 */
public class JsonHelper {

    private static final ObjectMapper mapper = new ObjectMapper();

    private static final ObjectMapper objectMapper = new ObjectMapper();
    /**
     * Reads and parses a JSON file from the given filesystem path.
     *
     * @param path the path to the JSON file to read
     * @return the root {@link JsonNode} of the parsed JSON content
     * @throws IOException if the file is not found or JSON parsing fails
     */
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
     * Returns an iterable over the field names of a JSON object node.
     *
     * <p>If the node is null or not an object, returns an empty iterable.</p>
     *
     * @param node the JSON node to inspect
     * @return iterable of field names if node is a JSON object, empty otherwise
     */
    public static Iterable<String> fieldNames(JsonNode node) {
        if (node == null || !node.isObject()) return () -> new Iterator<String>() {
            @Override public boolean hasNext() { return false; }
            @Override public String next() { return null; }
        };

        return () -> node.fieldNames();
    }

    /**
     * Loads a JSON file from the classpath resources and parses it into a {@link JsonNode}.
     *
     * @param path the classpath resource path of the JSON file
     * @return the root JSON node of the parsed resource
     * @throws RuntimeException if resource not found or reading/parsing fails
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
     * Recursively resolves placeholders inside a given JSON node using the provided context map.
     *
     * <p>Placeholders are expected to be in string values, e.g. {@code ${randomString:8}}.
     * This method returns a new JSON node with all placeholders replaced by their resolved values.</p>
     *
     * @param node the JSON node possibly containing placeholders
     * @param context the context map for placeholder resolution
     * @return a new {@link JsonNode} with placeholders resolved
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
