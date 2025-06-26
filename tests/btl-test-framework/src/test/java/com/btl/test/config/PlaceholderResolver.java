package com.btl.test.config;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Random;
/**
 * Utility class for resolving placeholders in strings.
 *
 * <p>Supports placeholders of the form <code>${key}</code> or <code>${key:param}</code>.
 * Values can be substituted from a provided context map or generated dynamically for keys like
 * <code>randomString</code> or <code>phoneNumber</code>.</p>
 *
 * <p>Example placeholders:</p>
 * <ul>
 *   <li><code>${token}</code> — replaced by value in context map under key "token"</li>
 *   <li><code>${randomString:8}</code> — replaced by a randomly generated 8-character string</li>
 *   <li><code>${phoneNumber:0801,10}</code> — replaced by a phone number string starting with "0801" and total length 10</li>
 * </ul>
 * @author rpillai
 * @see com.btl.test.config.JsonHelper#resolvePlaceholdersInNode(JsonNode, Map)
 */
public class PlaceholderResolver {

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\$\\{([^}]+)}");
    private static final Random random = new Random();

    /**
     * Resolves placeholders like <code>${key:param}</code> or <code>${key}</code> in the input string,
     * replacing them with corresponding values from the context map or generated dynamically.
     *
     * @param input the input string possibly containing placeholders
     * @param context the map providing replacement values for keys
     * @return the input string with all placeholders resolved or left unchanged if no match found
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
     * Generates a dynamic value for the given key and parameter.
     *
     * Supported keys:
     * <ul>
     *   <li><code>randomString</code>: generates a random alphanumeric string of given length (default 8)</li>
     *   <li><code>phoneNumber</code>: generates a numeric phone number string with optional prefix and total length</li>
     * </ul>
     *
     * @param key the placeholder key (e.g. "randomString", "phoneNumber")
     * @param param optional parameter string, e.g. length or prefix,length
     * @param context context map for additional lookup if needed
     * @return generated string value or null if key is not supported
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
        if ("numericString".equals(key)) {
            int length = 8; // default length
            if (param != null) {
                try {
                    length = Integer.parseInt(param);
                } catch (NumberFormatException ignored) {}
            }
            return generateNumericString(length);
        }

        // Fallback: try to return from context
        return context.getOrDefault(key, null);
    }

    /**
     * Generates a random alphanumeric string of the specified length.
     *
     * @param length desired length of the string
     * @return random alphanumeric string
     */
    public static String generateRandomString(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i=0; i < length; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        return sb.toString();
    }
    /**
     * Generates a phone number string.
     *
     * <p>The parameter can be:</p>
     * <ul>
     *   <li>null or empty: generate 12-digit random numeric string</li>
     *   <li>a number (e.g. "12"): total length of phone number</li>
     *   <li>a prefix (digits) shorter than default length: prefix + random digits to fill length</li>
     *   <li>prefix and length separated by comma (e.g. "0801,10")</li>
     * </ul>
     *
     * @param param optional parameter defining prefix and/or total length
     * @return generated phone number string
     * @throws IllegalArgumentException if prefix length exceeds total length
     */
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

    /**
     * Generates a random numeric string of the specified length.
     * <p>
     * Each character in the returned string is a digit between 0 and 9.
     * This method is typically used for generating test values such as phone numbers
     * or numeric IDs.
     *
     * @param length the desired length of the generated numeric string
     * @return a random string composed only of numeric digits
     */
    private static int safeParseInt(String str, int defaultVal) {
        try {
            return Integer.parseInt(str);
        } catch (Exception e) {
            return defaultVal;
        }
    }
}
