package com.btl.test.config;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Random;

public class PlaceholderResolver {

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\$\\{([^}]+)}");
    private static final Random random = new Random();

    /**
     * Resolves placeholders like ${key:param} or ${key} in the input string,
     * replacing them with values from context or generated dynamically.
     */
    public static String resolve(String input, Map<String, String> context) {
        if (input == null) return null;

        Matcher matcher = PLACEHOLDER_PATTERN.matcher(input);
        StringBuffer sb = new StringBuffer();

        while (matcher.find()) {
            String content = matcher.group(1); // e.g. "randomString:8" or "token"

            String key;
            String param = null;

            int colonIndex = content.indexOf(':');
            if (colonIndex != -1) {
                key = content.substring(0, colonIndex);
                param = content.substring(colonIndex + 1);
            } else {
                key = content;
            }

            // First check context map for direct value replacement
            String replacement = context.get(key);

            // If not found in context, try dynamic generation
            if (replacement == null) {
                replacement = generateValue(key, param, context);
            }

            // If still null, leave placeholder unchanged
            if (replacement == null) {
                replacement = matcher.group(0);
            }

            replacement = Matcher.quoteReplacement(replacement);
            matcher.appendReplacement(sb, replacement);
        }
        matcher.appendTail(sb);

        return sb.toString();
    }

    /**
     * Generate dynamic values based on key and param
     */
    public static String generateValue(String key, String param, Map<String,String> context) {
        if ("randomString".equals(key)) {
            int length = 8; // default length
            if (param != null) {
                try {
                    length = Integer.parseInt(param);
                } catch (NumberFormatException ignored) {}
            }
            return generateRandomString(length);
        }
        // Add other dynamic keys here as needed
        if ("phoneNumber".equals(key)) {
            return generatePhoneNumber(param);
        }

        // Fallback: try to return from context
        return context.getOrDefault(key, null);
    }

    /**
     * Generates a random alphanumeric string of given length
     */
    public static String generateRandomString(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i=0; i < length; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        return sb.toString();
    }

    public static String generatePhoneNumber(String param) {
        int defaultLength = 12;
        String prefix = "";
        int totalLength = defaultLength;

        if (param == null || param.isEmpty()) {
            // ${phoneNumber}
            return generateNumericString(defaultLength);
        }

        if (param.matches("\\d+")) {
            // ${phoneNumber:12} or ${phoneNumber:0801}
            if (param.length() < defaultLength) {
                prefix = param;
                totalLength = defaultLength;
            } else {
                totalLength = Integer.parseInt(param);
            }
        } else if (param.contains(",")) {
            // ${phoneNumber:0801,10}
            String[] split = param.split(",", 2);
            prefix = split[0];
            totalLength = safeParseInt(split[1], defaultLength);
        }

        int remaining = totalLength - prefix.length();
        if (remaining < 0) {
            throw new IllegalArgumentException("Prefix is longer than total phone number length");
        }

        return prefix + generateNumericString(remaining);
    }

    private static String generateNumericString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    private static int safeParseInt(String str, int defaultVal) {
        try {
            return Integer.parseInt(str);
        } catch (Exception e) {
            return defaultVal;
        }
    }
}
