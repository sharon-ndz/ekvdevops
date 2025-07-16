package com.btl.test.model;

import java.util.List;
import java.util.Map;

public class TestStep {
    private String story;
    private String name;
    private String method;
    private String path;
    private Map<String, Object> body;
    private Map<String, Object> assertions;
    private Map<String, String> extract;
    private List<String> requires;
    private List<String> expectedResults;
    private Map<String, Object> query;



    // Getters and setters
    public String getStory() { return story; }
    public void setStory(String story) { this.story = story; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public Map<String, Object> getBody() { return body; }
    public void setBody(Map<String, Object> body) { this.body = body; }
    public Map<String, Object> getAssertions() { return assertions; }
    public void setAssertions(Map<String, Object> assertions) { this.assertions = assertions; }
    public Map<String, String> getExtract() { return extract; }
    public void setExtract(Map<String, String> extract) { this.extract = extract; }
    public List<String> getRequires() { return requires; }
    public void setRequires(List<String> requires) { this.requires = requires; }
    public List<String> getExpectedResults() { return expectedResults; }
    public void setExpectedResults(List<String> expectedResults) { this.expectedResults = expectedResults;}
    public Map<String, Object> getQuery() {return query;}
    public void setQuery(Map<String, Object> query) {this.query = query;}

}