import { accessToken } from 'cypress/fixtures/tokens';
import { refreshToken } from 'cypress/fixtures/tokens';

const API_URL = 'https://norma.nomoreparties.space/api';

beforeEach(() => {
  window.localStorage.setItem('refreshToken', refreshToken);
  cy.setCookie('accessToken', accessToken);

  cy.fixture('ingredients.json').then((ingredients) => {
    cy.fixture('user.json').then((user) => {
      cy.intercept(
        {
          method: 'GET',
          url: `${API_URL}/auth/user`
        },
        user
      ).as('getUser');
    });

    cy.intercept(
      {
        method: 'GET',
        url: `${API_URL}/ingredients`
      },
      ingredients
    ).as('getIngredients');
  });

  cy.fixture('orders.json').then((orders) => {
    cy.intercept(
      {
        method: 'GET',
        url: `${API_URL}/orders/all`
      },
      orders
    ).as('getOrders');
  });

  cy.fixture('user.json').then((user) => {
    cy.intercept(
      {
        method: 'GET',
        url: `${API_URL}/auth/user`
      },
      user
    ).as('getUser');
  });

  cy.fixture('newOrder.json').then((newOrder) => {
    cy.intercept(
      {
        method: 'POST',
        url: `${API_URL}/orders`
      },
      newOrder
    ).as('newOrder');
  });

  cy.visit('/');
});

afterEach(() => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
});

describe('Проверка Burger Stellar', () => {
  it('Проверить добавление ингридиентов', () => {
    cy.get('main').screenshot('constructor_default');
    cy.get('.common_button').click({ multiple: true });
    cy.get('main').screenshot('constructor_used');
  });

  it('Проверить модалку ингридиентов', () => {
    const modal = '#modal';
    cy.contains('Краторная булка N-200i').click();
    cy.get('body').type('{esc}');
    cy.get(modal).should('not.exist');
  });

  it('Проверить создание заказа', () => {
    cy.get('.common_button').click({ multiple: true });
    cy.contains('Оформить заказ').click();
    cy.contains('51542').should('be.visible');
    cy.get('body').type('{esc}');
    cy.contains('Выберите булки').should('be.visible');
    cy.contains('Выберите начинку').should('be.visible');
  });
});
