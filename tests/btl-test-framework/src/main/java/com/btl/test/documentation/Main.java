package com.btl.test.documentation;

import com.btl.test.model.TestCase;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.*;

public class Main {
    private static final String HELP_MESSAGE = """
        Usage: java -jar document-generator.jar <command> <inputDir> <outputDir>
        Commands:
          json2md   - Convert JSON test cases to Markdown
          md2json   - Convert Markdown test cases to JSON
          
        Examples:
          java -jar document-generator.jar json2md ./test-cases/json ./test-cases/markdown
          java -jar document-generator.jar md2json ./test-cases/markdown ./test-cases/json
        """;

    public static void main(String[] args) {
        if (args.length != 3) {
            System.out.println(HELP_MESSAGE);
            System.exit(1);
        }

        String command = args[0];
        Path inputDir = Paths.get(args[1]);
        Path outputDir = Paths.get(args[2]);

        try {
            Files.createDirectories(outputDir);

            switch (command.toLowerCase()) {
                case "json2md" -> processDirectory(inputDir, outputDir, "json", "md");
                case "md2json" -> processDirectory(inputDir, outputDir, "md", "json");
                default -> {
                    System.err.println("Invalid command. Use 'json2md' or 'md2json'");
                    System.exit(1);
                }
            }
        } catch (IOException e) {
            System.err.println("Error processing directory: " + e.getMessage());
            System.exit(1);
        }
    }

    private static void processDirectory(Path inputDir, Path outputDir, String sourceExt, String targetExt)
            throws IOException {
        if (!Files.exists(inputDir)) {
            throw new IllegalArgumentException("Input directory does not exist: " + inputDir);
        }

        Files.walk(inputDir)
                .filter(Files::isRegularFile)
                .filter(path -> path.toString().endsWith("." + sourceExt))
                .filter(path -> !path.getFileName().toString().equals("index." + sourceExt))
                .forEach(sourcePath -> {
                    try {
                        // Get relative path from input directory
                        Path relativePath = inputDir.relativize(sourcePath);

                        // Create the target path with new extension
                        Path targetPath;
                        if (relativePath.getParent() != null) {
                            // File is in a subdirectory
                            String newName = replaceExtension(relativePath.getFileName().toString(), sourceExt, targetExt);
                            targetPath = outputDir.resolve(relativePath.getParent()).resolve(newName);
                        } else {
                            // File is in the root directory
                            String newName = replaceExtension(relativePath.toString(), sourceExt, targetExt);
                            targetPath = outputDir.resolve(newName);
                        }

                        // Ensure parent directories exist
                        Files.createDirectories(targetPath.getParent());

                        // Process the file
                        if (sourceExt.equals("json")) {
                            convertJsonToMarkdown(sourcePath, targetPath);
                        } else {
                            convertMarkdownToJson(sourcePath, targetPath);
                        }

                        System.out.println("Processed: " + sourcePath.getFileName());
                    } catch (IOException e) {
                        System.err.println("Error processing file " + sourcePath + ": " + e.getMessage());
                    }
                });
    }

    private static String replaceExtension(String filename, String oldExt, String newExt) {
        if (filename.endsWith("." + oldExt)) {
            return filename.substring(0, filename.length() - oldExt.length()) + newExt;
        }
        return filename;
    }

    private static void convertJsonToMarkdown(Path inputPath, Path outputPath) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        TestCase testCase = mapper.readValue(inputPath.toFile(), TestCase.class);

        DocumentationGenerator generator = new DocumentationGenerator();
        String markdown = generator.generateMarkdown(testCase);

        Files.writeString(outputPath, markdown);
    }

    private static void convertMarkdownToJson(Path inputPath, Path outputPath) throws IOException {
        String markdown = Files.readString(inputPath);

        DocumentationParser parser = new DocumentationParser();
        TestCase testCase = parser.parseMarkdown(markdown);
        parser.writeToJson(testCase, outputPath.toString());
    }
}