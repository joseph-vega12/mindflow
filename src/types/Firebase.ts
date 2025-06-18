export type FirebaseItem<ObjectInterface> = Record<string, ObjectInterface>;

export type FirestoreDocumentWithId<ObjectInterface> = ObjectInterface & { id: string };

export type FirebaseObjectWithKey<ObjectInterface> = { key: string } & ObjectInterface;
