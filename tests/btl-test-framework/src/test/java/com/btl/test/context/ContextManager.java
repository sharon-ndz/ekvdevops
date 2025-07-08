package com.btl.test.context;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Thread-safe context manager using ThreadLocal for parallel test isolation.
 */
public class ContextManager implements AutoCloseable {

    private static final ThreadLocal<Map<String, String>> threadContext = ThreadLocal.withInitial(HashMap::new);

    public void put(String key, String value) {
        threadContext.get().put(key, value);
    }

    public Optional<String> get(String key) {
        return Optional.ofNullable(threadContext.get().get(key));
    }

    public boolean contains(String key) {
        return threadContext.get().containsKey(key);
    }

    public Map<String, String> getAll() {
        return Collections.unmodifiableMap(threadContext.get());
    }

    public void clear() {
        threadContext.get().clear();
    }

    public void remove() {
        threadContext.remove(); // completely removes this thread's context
    }

    @Override
    public void close() throws Exception {

    }
}
