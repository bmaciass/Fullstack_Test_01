export class LogoutUseCase {
  async execute(): Promise<void> {
    // Stateless approach - no server-side action needed
    // Client is responsible for clearing tokens from storage
    // This use case exists for consistency and future extensibility
    // (e.g., adding token blacklist, logging, etc.)
    return
  }
}
