import React, { FC, useMemo, useState } from 'react';

import { Box, SimpleGrid } from '@chakra-ui/react';
import { find, get, map } from 'lodash';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import useLocalStorage from 'lib/customHooks/useLocalStorage';

import {
  AdditionalDiagnostics,
  DiagnosticResult,
  DiagnosticResultDocumentWithId,
  ResumedDiagnosticDocumentWithId
} from 'types';

import { AdditionalDiagnosticsCard } from 'components/Pages/Diagnostic/AdditionalDiagnosticsCard.tsx';
import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { DiagnosticCard } from 'components/Pages/Diagnostic';
import { DiagnosticConfirmationModal } from 'components/Pages/Diagnostic';

import { getDiagnosticRequirements } from 'lib/core/diagnostic';
import { useAuthContext, useFirebaseContext } from 'lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const Diagnostics: FC = ({ }) => {
  const { user, refetchUserDetails } = useAuthContext();
  const navigate = useNavigate();
  const testType = user?.userDetails?.testType;

  const [completedDiagnosticsMessage, setCompletedDiagnosticsMessage] = useLocalStorage(
    'completedDiagnosticsMessage',
    'false'
  );

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<ResumedDiagnosticDocumentWithId>();

  const diagnosticsQuery = useQuery(
    ['diagnostics', testType],
    async () => {
      const diagnosticsQuery = query(
        collection(db, 'diagnostics').withConverter<ResumedDiagnosticDocumentWithId>({
          fromFirestore: (doc) => {
            const diagnostic = doc.data();

            return {
              id: doc.id,
              name: get(diagnostic, 'name'),
              category: get(diagnostic, 'category'),
              order: get(diagnostic, 'order')
            };
          },
          toFirestore: (doc: ResumedDiagnosticDocumentWithId) => doc
        }),
        where('category', '==', testType),
        orderBy('order', 'asc')
      );

      const diagnosticDocs = await getDocs(diagnosticsQuery)

      return diagnosticDocs.docs.map((doc) => doc.data() as ResumedDiagnosticDocumentWithId);
    },
    {
      enabled: !!testType,
      refetchOnMount: false,
      refetchOnWindowFocus: true
    }
  );

  const diagnosticResultsQuery = useQuery(
    ['diagnosticResults', testType],
    async () => {
      const diagnosticResultsQuery =
        query(
          collection(db, 'diagnosticResults')
            .withConverter<DiagnosticResultDocumentWithId>({
              fromFirestore: (doc) => {
                return {
                  id: doc.id,
                  ...(doc.data() as DiagnosticResult)
                };
              },
              toFirestore: (doc: DiagnosticResultDocumentWithId) => doc
            }), where('category', '==', testType),
          where('userId', '==', user?.uid)
        )

      const diagnosticResultDocs = await getDocs(diagnosticResultsQuery)
      return diagnosticResultDocs.docs.map((doc) => doc.data());
    },
    {
      enabled: !!testType,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      onSettled: (data) => {
        if (completedDiagnosticsMessage === false && data.length >= 4) {
          setCompletedDiagnosticsMessage(true);
          toast.success('Congratulations! You have unlocked the bonus tests');
        }
      }
    }
  );

  const additionalDiagnosticsQuery = useQuery(
    ['Additional Diagnostics', AdditionalDiagnostics[testType]],
    async () => {
      const diagnosticsQuery =
        query(
          collection(db, 'diagnostics')
            .withConverter<ResumedDiagnosticDocumentWithId>({
              fromFirestore: (doc) => {
                const diagnostic = doc.data();

                return {
                  id: doc.id,
                  name: get(diagnostic, 'name'),
                  category: get(diagnostic, 'category'),
                  order: get(diagnostic, 'order')
                };
              },
              toFirestore: (doc: ResumedDiagnosticDocumentWithId) => doc
            }), where('category', '==', AdditionalDiagnostics[testType]),
          orderBy('order', 'asc')
        )

      const diagnosticDocs = await getDocs(diagnosticsQuery)
      return diagnosticDocs.docs.map((doc) => doc.data() as ResumedDiagnosticDocumentWithId);
    },
    {
      enabled: !!testType,
      refetchOnMount: false,
      refetchOnWindowFocus: true
    }
  );

  const additionalDiagnosticsResultsQuery = useQuery(
    ['Additional Diagnostics Results', AdditionalDiagnostics[testType]],
    async () => {
      const diagnosticResultsQuery =
        query(
          collection(db, 'diagnosticResults')
            .withConverter<DiagnosticResultDocumentWithId>({
              fromFirestore: (doc) => {
                return {
                  id: doc.id,
                  ...(doc.data() as DiagnosticResult)
                };
              },
              toFirestore: (doc: DiagnosticResultDocumentWithId) => doc
            }), where('category', '==', AdditionalDiagnostics[testType]),
          where('userId', '==', user?.uid)
        )

      const diagnosticResultDocs = await getDocs(diagnosticResultsQuery)
      return diagnosticResultDocs.docs.map((doc) => doc.data());
    },
    {
      enabled: !!testType,
      refetchOnMount: true,
      refetchOnWindowFocus: true
    }
  );

  const { mutate: createDiagnosticResult } = useMutation(['createDiagnosticResult'], (data: DiagnosticResult) =>
    addDoc(collection(db, 'diagnosticResults'), data)
  );

  const startDiagnostic = async () => {
    const defaultDiagnosticResult: Partial<DiagnosticResult> = {
      finished: false,

      diagnosticId: selectedDiagnostic?.id,

      name: selectedDiagnostic?.name,
      category: selectedDiagnostic?.category,
      order: selectedDiagnostic?.order,

      answers: [],
      answersTime: [],

      userId: user?.uid,
      timestamp: +new Date()
    };

    if (user?.userDetails?.businessId) {
      defaultDiagnosticResult.businessId = user?.userDetails?.businessId;
    }

    // @ts-ignore
    createDiagnosticResult(defaultDiagnosticResult);

    await refetchUserDetails();

    navigate(`/diagnostics/${selectedDiagnostic?.id}`);
  };

  const modalProps = useMemo(
    () => ({
      title: 'Confirmation Message',
      isOpen: isModalOpen,
      onClose: () => setModalOpen(false),
      onConfirmation: () => startDiagnostic()
    }),
    [isModalOpen]
  );

  const diagnosticResultsList = useMemo(() => {
    // if (diagnosticResultsQuery.data?.length >= 4) {
    //   toast.success('Congratulations! You have unlocked the bonus tests');
    // }
    if (diagnosticsQuery.isLoading || diagnosticsQuery.isLoading) {
      return [];
    }

    return map(diagnosticsQuery.data, (diagnostic: ResumedDiagnosticDocumentWithId) => {
      const result = find<DiagnosticResultDocumentWithId>(diagnosticResultsQuery.data, { diagnosticId: diagnostic.id });

      return {
        diagnostic,
        result
      };
    });
  }, [diagnosticsQuery.data, diagnosticResultsQuery.data]);

  const additionalDiagnosticResultsList = useMemo(() => {
    if (additionalDiagnosticsQuery.isLoading || additionalDiagnosticsQuery.isLoading) {
      return [];
    }

    return map(additionalDiagnosticsQuery.data, (diagnostic: ResumedDiagnosticDocumentWithId) => {
      const result = find<DiagnosticResultDocumentWithId>(additionalDiagnosticsResultsQuery.data, {
        diagnosticId: diagnostic.id
      });

      return {
        diagnostic,
        result
      };
    });
  }, [additionalDiagnosticsQuery.data, additionalDiagnosticsResultsQuery.data]);

  const allowedDiagnosticKey = useMemo(() => {
    return find(diagnosticResultsList, ({ result }) => !result)?.diagnostic?.id;
  }, [diagnosticResultsList]);

  const allowedAdditionalDiagnosticKey = useMemo(() => {
    return find(additionalDiagnosticResultsList, ({ result }) => !result)?.diagnostic?.id;
  }, [additionalDiagnosticResultsList]);

  const handleSelectedDiagnostic = (diagnostic: ResumedDiagnosticDocumentWithId) => {
    setSelectedDiagnostic(diagnostic);
    setModalOpen(true);
  };

  return (
    <BasePage spacing="md" width="100%" height="100%">
      <Box>
        <BasePageTitle title="Diagnostics Tests" paddingBottom="md" />
        <SimpleGrid
          spacing={{ lg: 10, md: 6 }}
          columns={{
            lg: 2,
            xl: diagnosticsQuery.data?.length ?? 0
          }}
        >
          {diagnosticResultsList?.map(({ diagnostic, result }) => (
            <DiagnosticCard
              result={result}
              key={diagnostic.id}
              requirements={getDiagnosticRequirements(diagnostic)}
              diagnostic={diagnostic}
              disabled={allowedDiagnosticKey !== diagnostic.id}
              onGoToDiagnostic={(diagnostic) => handleSelectedDiagnostic(diagnostic)}
            />
          ))}
        </SimpleGrid>
        <DiagnosticConfirmationModal {...modalProps} />
      </Box>
      {diagnosticResultsQuery.data?.length >= 4 ? (
        <Box mt="6">
          <BasePageTitle title="Bonus Tests" paddingBottom="md" />
          <SimpleGrid
            spacing={{ lg: 10, md: 6 }}
            columns={{
              lg: 2,
              xl: diagnosticsQuery.data?.length ?? 0
            }}
          >
            {additionalDiagnosticResultsList?.map(({ diagnostic, result }) => (
              <AdditionalDiagnosticsCard
                result={result}
                key={diagnostic.id}
                diagnostic={diagnostic}
                disabled={allowedAdditionalDiagnosticKey !== diagnostic.id}
                onGoToDiagnostic={(diagnostic) => handleSelectedDiagnostic(diagnostic)}
              />
            ))}
          </SimpleGrid>
          <DiagnosticConfirmationModal {...modalProps} />
        </Box>
      ) : null}
    </BasePage>
  );
};
