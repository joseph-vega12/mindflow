import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import 'typeface-montserrat';
import 'typeface-roboto';

import { AuthProvider } from './lib/firebase/AuthProvider';
import { FirebaseProvider } from './lib/firebase/FirebaseProvider/FirebaseProvider';

import { ActivateExistingLicense } from 'pages/activateExistingLicense';
import { ActivateLicense } from 'pages/activateLicense';
import { BetaSignUp } from 'pages/beta';
import { BusinessPurchaseAdditionalLicenses } from 'pages/businessPurchaseAdditionalLicenses';
import { LoginPage } from 'pages/login';
import { WaitingRoom } from 'pages/waitingRoom';
import { PagesRouter } from 'pages/router';
import { ResetPassword } from 'pages/resetPassword';

import { PencilLoginPage } from 'pages/PencilLoginPage';
import { BusinessDiscount } from 'pages/businessDiscount';
import { BusinessDiscountCallback } from 'pages/businessDiscountCallback';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import theme from 'theme';
const queryClient = new QueryClient();

function App() {
  const paypalOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID ?? '',
    // 'client-id': "AWdW5Eysiuul-9XhaeHnec0SIR281e2N6nqiRQmHAcxNScrNYvtwjFuPacXgHEtyW3XCMibNgWjsKdOP",
    currency: 'USD',
    components: 'buttons'
  };

  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_KEY}>
      <PayPalScriptProvider options={paypalOptions}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <ChakraProvider theme={theme}>
            <BrowserRouter>
              <FirebaseProvider>
                <AuthProvider>
                  <Routes>
                    <Route path="/activate-purchased-license/:provider/:orderId" element={<ActivateLicense />} />
                    <Route
                      path="/additional-purchased-license/:provider/:orderId/:businessId/:quantity"
                      element={<BusinessPurchaseAdditionalLicenses />}
                    />
                    <Route path="/activate-license/:licenseId" element={<ActivateExistingLicense />} />

                    {/* <Route path="/business-discount" element={<BusinessDiscount />} exact={true} /> */}
                    <Route path="/business-discount" element={<BusinessDiscount />} />
                    <Route
                      path="/business-discount/callback/:provider/:orderId/:id"
                      element={<BusinessDiscountCallback />}
                    />

                    <Route path="/beta-sign-up" element={<BetaSignUp />} />
                    <Route path="/reset-password/:code" element={<ResetPassword />} />


                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/oauth/waiting-room" element={<WaitingRoom />} />
                    <Route path="/pencilSpacesLogin" element={<PencilLoginPage />} />
                    <Route path="/*" element={<PagesRouter />} />
                    {/* <PagesRouter /> */}
                  </Routes>
                </AuthProvider>
              </FirebaseProvider>
            </BrowserRouter>
          </ChakraProvider>
          <ToastContainer />
        </QueryClientProvider>
      </PayPalScriptProvider>
    </GoogleReCaptchaProvider >
  );
}

export default App;