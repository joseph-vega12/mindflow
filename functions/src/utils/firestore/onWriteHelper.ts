import { Change, firestore } from 'firebase-functions';
import { isNil } from 'lodash';

export enum FirestoreWriteEventType {
  Delete,
  Create,
  Update,
  Unknown
}

/**
 * Returns what type of operation the onWrite was.
 * @param change
 */
const onWriteHelper = (change: Change<firestore.DocumentSnapshot>): FirestoreWriteEventType => {
  const oldData = change.before.data();

  const newData = change.after.data();

  if (isNil(newData)) {
    return FirestoreWriteEventType.Delete;
  }

  if (oldData && newData) {
    return FirestoreWriteEventType.Update;
  }

  if (!oldData && newData) {
    return FirestoreWriteEventType.Create;
  }

  return FirestoreWriteEventType.Unknown;
};

export default onWriteHelper;
