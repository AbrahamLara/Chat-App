import Vue from 'vue';
import { ActionTree } from 'vuex';
import { RootState } from '@/store/store-states';
import { THEME } from '@/utils/theme-utils';
import { loginUser, registerUser } from '@/api/auth-api';
import { namespaceAlertsMutation } from '@/store/modules';
import { createAlertMessage, isFormErrorMessage } from '@/utils/alerts-utils';
import { LoginFormFields, RegisterFormFields } from '@/utils/auth-utils';
import {
  ADD_ERROR,
  ADD_SUCCESS,
  SET_ERRORS,
} from '@/store/constants/alerts-constants';
import {
  SET_THEME,
  LOGIN_USER,
  REGISTER_USER,
  SET_IS_AUTHENTICATED,
} from '@/store/constants/root-constants';

// Actions that affect how the application looks and behaves.
const appActions: ActionTree<RootState, RootState> = {
  [SET_THEME]: ({ commit }, theme: THEME) => {
    commit(SET_THEME, theme);
  },
  [LOGIN_USER]: async ({ commit }, loginForm: LoginFormFields) => {
    try {
      const res = await loginUser(loginForm);
      const data = await res.json();

      if (res.ok) {
        // Set the user as authenticated.
        commit(SET_IS_AUTHENTICATED, true);
        // Store the provided token as a cookie.
        Vue.$cookies.set('token', data.token, '1h');
      } else if (isFormErrorMessage(data)) {
        commit(namespaceAlertsMutation(SET_ERRORS), data);
      } else {
        commit(namespaceAlertsMutation(ADD_ERROR), data);
      }
    } catch (event) {
      console.log(event);
      const genericMessage = createAlertMessage(
        'An error occurred trying to sign you in!'
      );
      commit(namespaceAlertsMutation(ADD_ERROR), genericMessage);
    }
  },
  [REGISTER_USER]: async ({ commit }, registerForm: RegisterFormFields) => {
    try {
      const res = await registerUser(registerForm);
      const data = await res.json();

      if (res.ok) {
        commit(namespaceAlertsMutation(ADD_SUCCESS), data);
      } else if (isFormErrorMessage(data)) {
        commit(namespaceAlertsMutation(SET_ERRORS), data);
      } else {
        commit(namespaceAlertsMutation(ADD_ERROR), data);
      }
    } catch (event) {
      const genericMessage = createAlertMessage(
        'An error occurred trying to register you!'
      );
      commit(namespaceAlertsMutation(ADD_ERROR), genericMessage);
    }
  },
  [SET_IS_AUTHENTICATED]: ({ commit }, isAuthenticated: boolean) => {
    commit(SET_IS_AUTHENTICATED, isAuthenticated);
  },
};

export default appActions;
