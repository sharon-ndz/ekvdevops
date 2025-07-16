package com.btl.test.runner;

import io.restassured.specification.RequestSpecification;

/**
 * A simple wrapper that contains a fully built RestAssured request
 * along with a pretty-printed body for reporting/logging.
 */
public class RequestData {

    private final RequestSpecification request;
    private final String prettyBody;

    public RequestData(RequestSpecification request, String prettyBody) {
        this.request = request;
        this.prettyBody = prettyBody;
    }

    public RequestSpecification getRequest() {
        return request;
    }

    public String getPrettyBody() {
        return prettyBody;
    }
}
