
// src/lib/firebase/errors.ts

export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
    requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
    public context: SecurityRuleContext;

    constructor(context: SecurityRuleContext) {
        const message = `Firestore Permission Denied: Insufficient permissions for ${context.operation} on ${context.path}.`;
        super(message);
        this.name = 'FirestorePermissionError';
        this.context = context;
        Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }
}
