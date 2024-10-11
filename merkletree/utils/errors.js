export function throwError(message) {
    throw new Error(message);
}
export class InvariantError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvariantError';
    }
}
export class InvalidArgumentError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidArgumentError';
    }
}
export function validateArgument(condition, message) {
    if (!condition) {
        throw new InvalidArgumentError(message);
    }
}
export function invariant(condition, message) {
    if (!condition) {
        throw new InvariantError(message);
    }
}
//# sourceMappingURL=errors.js.map