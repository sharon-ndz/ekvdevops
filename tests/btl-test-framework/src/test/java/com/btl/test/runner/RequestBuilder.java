package com.btl.test.runner;

import com.btl.test.config.JsonHelper;
import com.btl.test.config.PlaceholderResolver;
import com.btl.test.context.ContextManager;
import com.fasterxml.jackson.databind.JsonNode;
import io.restassured.specification.RequestSpecification;

import static io.restassured.RestAssured.given;

public class RequestBuilder {

    private final ContextManager context;

    public RequestBuilder(ContextManager context) {
        this.context = context;
    }

    /**
     * Builds a RestAssured request based on the step definition and context.
     * Also returns a pretty-printed body string for reporting.
     */
    public RequestData build(JsonNode stepNode) {
        RequestSpecification request = given();
        request.header("Content-Type", "application/json");

        // Query parameters
        JsonNode queryParams = stepNode.get("query");
        if (queryParams != null && queryParams.isObject()) {
            for (String param : JsonHelper.fieldNames(queryParams)) {
                String rawValue = queryParams.get(param).asText();
                String resolved = PlaceholderResolver.resolve(rawValue, context.getAll());
                request.queryParam(param, resolved);
            }
        }

        // Headers
        JsonNode headersNode = stepNode.get("headers");
        if (headersNode != null && headersNode.isObject()) {
            for (String header : JsonHelper.fieldNames(headersNode)) {
                String rawValue = headersNode.get(header).asText();
                String resolved = PlaceholderResolver.resolve(rawValue, context.getAll());
                request.header(header, resolved);
            }
        }

        // Requires
        JsonNode requires = stepNode.get("requires");
        if (requires != null && requires.isArray()) {
            for (JsonNode required : requires) {
                String key = required.asText();

                if (key.endsWith("_token")) {
                    String token = context.get(key).orElse(null);
                    if (token != null) {
                        request.header("Authorization", "Bearer " + token);
                    } else {
                        throw new org.opentest4j.AssertionFailedError("Required context key missing: token");
                    }
                } else if (!context.contains(key)) {
                    throw new org.opentest4j.AssertionFailedError("Required context key missing: " + key);
                }
            }
        }

        // Body
        String prettyBody = null;
        JsonNode bodyNode = stepNode.get("body");
        if (bodyNode != null && !bodyNode.isNull()) {
            JsonNode resolvedBody = JsonHelper.resolvePlaceholdersInNode(bodyNode, context.getAll());
            String rawBody = resolvedBody.toString();
            prettyBody = resolvedBody.toPrettyString();
            request.body(rawBody);
        }

        return new RequestData(request, prettyBody);
    }
}
