package com.btl.test;

import com.btl.test.base.TestBase;
import com.btl.test.flow.FlowTestGenerator;
import org.junit.jupiter.api.*;

import java.util.stream.Stream;

import org.junit.jupiter.api.DynamicTest;

/**
 * Entry point for executing all API flows defined under configs/flows.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ApiSuiteTest extends TestBase {

    @BeforeAll
    public static void init() throws Exception {
        System.out.println("⚙️ Initializing test base...");
        setupBase();
    }

    /**
     * Dynamically generates and executes test flows.
     */
    @TestFactory
    public Stream<DynamicTest> generateTests() throws Exception {
        return new FlowTestGenerator().generateAllTests();
    }

    /**
     * Basic smoke test to verify environment config.
     */

    public void checkConfigTest() {
        System.out.println("✅ Config is using URL: " + baseUrl);
    }
}
