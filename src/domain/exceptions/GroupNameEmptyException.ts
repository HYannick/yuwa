export class GroupNameEmptyException extends Error {
  constructor() {
    super("Group name cannot be empty");
  }
}