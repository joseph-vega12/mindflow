import React, { FC } from 'react';

import { ActivitiesListing } from 'components/Pages/BusinessDashboard';
import { BasePage } from 'components/layout/Pages';
import { FeedActivity, FeedActivityWithId } from 'types';
import { useFirebaseContext } from 'lib/firebase';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';

import { sortBy } from 'lodash';
import { db } from 'lib/firebase/firebaseInit';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';

export const StudentsActivities: FC = () => {
  const { firestore } = useFirebaseContext();
  const { businessId } = useParams<{ businessId: string }>();

  const feedQuery = useQuery(
    ['owner', 'students', 'feed'],
    async () => {
      const feedRef = collection(db, 'feed')

      const feedQuery = query(feedRef, where('businessId', '==', businessId), limit(20)).withConverter<FeedActivityWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as FeedActivity)
          };
        },
        toFirestore: (doc: FeedActivityWithId) => doc
      })

      const feedSnap = await getDocs(feedQuery)

      const feedResults = feedSnap.docs.map((doc) => doc.data());

      return sortBy(feedResults, 'timestamp').reverse()
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true
    }
  );

  return (
    <BasePage spacing="md">
      <ActivitiesListing data={feedQuery.data ?? []} isLoading={feedQuery.isLoading} />
    </BasePage>
  );
};
