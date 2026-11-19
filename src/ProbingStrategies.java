import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Three classic open-addressing strategies on the SAME keys.
 * Models insertion of distinct integer keys, no deletion or automatic resize.
 * Mirrors engine.js used by the interactive report.
 */
public final class ProbingStrategies {
    private static final int[] VALID_SIZES = {11, 13, 17, 19, 23, 29, 31};
    public enum Method { LINEAR, QUADRATIC, DOUBLE }

    public static int mod(int k, int m) {
        return Math.floorMod(k, m);
    }
    public static int secondHash(int k) {
        return 7 - Math.floorMod(k, 7);
    }
    public static int probe(Method method, int key, int attempt, int m) {
        long home = mod(key, m);
        long offset;
        switch (method) {
            case LINEAR: offset = attempt; break;
            case QUADRATIC: offset = (long) attempt * attempt; break;
            case DOUBLE: offset = (long) attempt * secondHash(key); break;
            default: throw new AssertionError("Unsupported method");
        }
        return (int) ((home + offset) % m);
    }
    public static final class Result {
        public final Integer[] slots;
        public final int probes, collisions, inserted, failed;
        private Result(Integer[] slots, int probes, int collisions, int inserted, int failed) {
            this.slots = slots;
            this.probes = probes;
            this.collisions = collisions;
            this.inserted = inserted;
            this.failed = failed;
        }
        @Override public String toString() {
            return "slots=" + Arrays.toString(slots)
                + ", probes=" + probes + ", collisions=" + collisions
                + ", inserted=" + inserted + ", failed=" + failed;
        }
    }
    public static Result insertAll(Method method, int[] keys, int m) {
        boolean allowed = Arrays.stream(VALID_SIZES).anyMatch(x -> x == m);
        if (!allowed) throw new IllegalArgumentException("M must be a listed prime > 7");
        Set<Integer> distinct = new HashSet<>();
        for (int key : keys) if (!distinct.add(key))
            throw new IllegalArgumentException("Duplicate keys are not part of this model");
        Integer[] slots = new Integer[m];
        int probes = 0, collisions = 0, inserted = 0, failed = 0;
        for (int key : keys) {
            Set<Integer> visited = new HashSet<>();
            boolean success = false;
            for (int i = 0; i < m; i++) {
                int p = probe(method, key, i, m);
                if (!visited.add(p)) break;
                probes++;
                if (slots[p] == null) {
                    slots[p] = key;
                    inserted++;
                    success = true;
                    break;
                }
                collisions++;
            }
            if (!success) failed++;
        }
        return new Result(slots, probes, collisions, inserted, failed);
    }
    public static int find(Method method, Integer[] slots, int key) {
        Set<Integer> visited = new HashSet<>();
        int m = slots.length;
        for (int i = 0; i < m; i++) {
            int p = probe(method, key, i, m);
            if (!visited.add(p)) break;
            if (slots[p] == null) return -1;
            if (slots[p] == key) return p;
        }
        return -1;
    }
    public static void main(String[] args) {
        int[] keys = {11, 22, 33, 44};
        for (Method method : Method.values()) {
            Result r = insertAll(method, keys, 11);
            System.out.println(method + ": " + r);
            if (find(method, r.slots, 44) < 0)
                throw new AssertionError("Cannot find inserted key");
        }
    }
}
