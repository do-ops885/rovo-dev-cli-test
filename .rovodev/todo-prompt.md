Refactor the CoderAgent class in `rovo-code-flow/src/agents/sparc/coder-agent.ts` to fully integrate with Rovo Dev API. Implement the following changes:

1. **Remove all mock implementations** and replace with actual Rovo Dev API calls
2. **Implement proper response parsing** for all API endpoints:
   - Requirements analysis (lines 140-156)
   - Code generation (lines 318-323)
   - Testing (lines 542-547)
   - Optimization (lines 606-611)
3. **Enhance error handling**:
   - Throw specific errors for different failure types
   - Add retry logic for transient failures
   - Implement better fallback mechanisms
4. **Add validation** for all API responses:
   - Use Zod schemas to validate response structures
   - Handle invalid responses gracefully
5. **Implement proper ACLI integration**:
   - Initialize ACLI client correctly
   - Handle authentication and error cases
6. **Add JSDoc comments** for all methods including:
   - Parameters
   - Return types
   - Possible errors
7. **Create utility functions** for common operations:
   - API request/response handling
   - Error formatting
   - Response validation

Ensure all changes maintain existing functionality while replacing mock implementations with real Rovo Dev API integrations. Preserve the fallback behavior but mark it clearly as a development-only feature.
