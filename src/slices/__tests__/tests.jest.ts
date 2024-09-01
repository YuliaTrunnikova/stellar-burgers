import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import stellarBurgerSlice, {
  addIngredient,
  closeOrderRequest,
  deleteIngredient,
  moveIngredientDown,
  moveIngredientUp,
  selectConstructorItems,
  selectOrderModalData,
  selectOrderRequest,
  getUserThunk,
  initialState,
  fetchIngredients,
  fetchNewOrder,
  fetchLoginUser,
  fetchRegisterUser,
  fetchUpdateUser,
  fetchUserOrders,
  fetchFeed,
  fetchLogout
} from '../StellarBurgerSlice';
import { mockStore, mockIngredient, mockBun } from './mockData';
import rootReducer from '../rootReducer';

const mockErrorResponse = { name: 'test', message: 'error' };
const mockUserResponse = {
  success: true,
  user: { name: 'user', email: 'user@mail.ru' }
};
const mockIngredientsResponse = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
  }
];
const mockOrderResponse = {
  success: true,
  name: 'testname',
  order: {
    _id: '664e927097ede0001d06bdb9',
    ingredients: [
      '643d69a5c3f7b9001cfa093d',
      '643d69a5c3f7b9001cfa093e',
      '643d69a5c3f7b9001cfa093d'
    ],
    status: 'done',
    name: 'Флюоресцентный люминесцентный бургер',
    createdAt: '2024-05-23T00:48:48.039Z',
    updatedAt: '2024-05-23T00:48:48.410Z',
    number: 40680
  }
};

const mockFeedResponse = {
  success: true,
  total: 100,
  totalToday: 10,
  orders: [mockOrderResponse.order]
};

function initStore() {
  return configureStore({
    reducer: {
      stellarBurger: stellarBurgerSlice
    },
    preloadedState: {
      stellarBurger: mockStore
    }
  });
}

describe('Проверка rootReducer', () => {
  test('Инициализация стора с неизвестным экшеном', () => {
    const store = configureStore({
      reducer: rootReducer
    });

    const state = store.getState();
    expect(state.burgers).toEqual(initialState);
  });
});

describe('Тесты экшенов', () => {
  test('Добавить ингредиент', () => {
    const store = initStore();
    store.dispatch(addIngredient(mockIngredient));
    store.dispatch(addIngredient(mockBun));

    const constructor = selectConstructorItems(store.getState());
    expect(constructor.ingredients.length).toEqual(4);
    expect(constructor.bun.name === 'Краторная булка N-200i');
  });

  test('Удалить ингредиент', () => {
    const store = initStore();
    const before = selectConstructorItems(store.getState()).ingredients.length;
    store.dispatch(deleteIngredient(mockIngredient));
    const after = selectConstructorItems(store.getState()).ingredients.length;
    expect(before).toBe(3);
    expect(after).toBe(2);
  });

  test('Очищение конструктора после заказа', () => {
    const store = initStore();
    store.dispatch(closeOrderRequest());

    const orderRequest = selectOrderRequest(store.getState());
    const orderModalData = selectOrderModalData(store.getState());
    const constructorItems = selectConstructorItems(store.getState());

    expect(orderRequest).toBe(false);
    expect(orderModalData).toBe(null);
    expect(constructorItems).toEqual({
      bun: {
        price: 0
      },
      ingredients: []
    });
  });

  test('Переместить ингредиент вверх', () => {
    const store = initStore();
    let ingredients = selectConstructorItems(store.getState()).ingredients;
    const lastIngredient = ingredients[ingredients.length - 1];

    store.dispatch(moveIngredientUp(lastIngredient));

    ingredients = selectConstructorItems(store.getState()).ingredients;

    expect(ingredients[ingredients.length - 2]).toEqual(lastIngredient);
  });

  test('Переместить ингредиент вниз', () => {
    const store = initStore();
    let ingredients = selectConstructorItems(store.getState()).ingredients;
    const firstIngredient = ingredients[0];

    store.dispatch(moveIngredientDown(firstIngredient));

    ingredients = selectConstructorItems(store.getState()).ingredients;

    expect(ingredients[1]).toEqual(firstIngredient);
  });
});

describe('Тесты асинхронных экшенов', () => {
  test('getUserThunk pending', () => {
    const state = stellarBurgerSlice(initialState, getUserThunk.pending(''));

    expect(state.loading).toBe(true);
  });

  test('getUserThunk fulfilled', () => {
    const state = stellarBurgerSlice(
      initialState,
      getUserThunk.fulfilled(mockUserResponse, '')
    );

    expect(state.user).toEqual(mockUserResponse.user);
  });

  test('getUserThunk rejected', () => {
    const state = stellarBurgerSlice(
      initialState,
      getUserThunk.rejected(mockErrorResponse, '')
    );

    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toEqual({ name: '', email: '' });
  });

  test('Test fetchIngredients pending', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchIngredients.pending('')
    );

    expect(state.loading).toBe(true);
  });

  test('Test fetchIngredients fulfilled', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchIngredients.fulfilled(mockIngredientsResponse, '')
    );

    expect(state.loading).toBe(false);
    expect(state.ingredients).toEqual(mockIngredientsResponse);
  });

  test('Test fetchIngredients rejected', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchIngredients.rejected(mockErrorResponse, '')
    );

    expect(state.loading).toBe(false);
  });

  test('Test fetchNewOrder pending', () => {
    const mockOrder = ['testid1', 'testid2', 'testid3'];
    const state = stellarBurgerSlice(
      initialState,
      fetchNewOrder.pending('', mockOrder)
    );

    expect(state.orderRequest).toBe(true);
  });

  test('Test fetchNewOrder rejected', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchNewOrder.rejected(mockErrorResponse, '', [''])
    );

    expect(state.orderRequest).toBe(false);
  });

  test('Test fetchNewOrder fulfilled', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchNewOrder.fulfilled(mockOrderResponse, '', [''])
    );

    expect(state.orderModalData).toEqual(mockOrderResponse.order);
    expect(state.orderRequest).toBe(false);
  });

  test('Test fetchLoginUser pending', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchLoginUser.pending('', { email: 'test@mail.ru', password: 'test' })
    );

    expect(state.loading).toBe(true);
  });

  test('Test fetchLoginUser rejected', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchLoginUser.rejected(mockErrorResponse, '', {
        email: 'test@mail.ru',
        password: 'test'
      })
    );

    expect(state.loading).toBe(false);
    expect(state.errorText).toBe(mockErrorResponse.message);
  });

  test('Test fetchLoginUser fulfilled', () => {
    const mockLoginResponse = {
      success: true,
      refreshToken: 'testtoken',
      accessToken: 'testaccess',
      user: { name: 'testuser', email: 'testuser@mail.ru' }
    };
    const state = stellarBurgerSlice(
      initialState,
      fetchLoginUser.fulfilled(mockLoginResponse, '', {
        password: 'testuser',
        email: 'testuser@mail.ru'
      })
    );

    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
  });

  test('Test fetchRegisterUser pending', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchRegisterUser.pending('', {
        name: 'user',
        email: 'test@mail.ru',
        password: 'test'
      })
    );

    expect(state.loading).toBe(true);
  });

  test('Test fetchRegisterUser rejected', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchRegisterUser.rejected(mockErrorResponse, '', {
        name: 'user',
        email: 'test@mail.ru',
        password: 'test'
      })
    );

    expect(state.loading).toBe(false);
    expect(state.errorText).toBe(mockErrorResponse.message);
  });

  test('Test fetchRegisterUser fulfilled', () => {
    const mockRegisterResponse = {
      success: true,
      refreshToken: 'testtoken',
      accessToken: 'testaccess',
      user: { name: 'testuser', email: 'testuser@mail.ru' }
    };
    const state = stellarBurgerSlice(
      initialState,
      fetchRegisterUser.fulfilled(mockRegisterResponse, '', {
        name: 'user',
        password: 'testuser',
        email: 'testuser@mail.ru'
      })
    );

    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe(false);
  });

  test('Test fetchFeed pending', () => {
    const state = stellarBurgerSlice(initialState, fetchFeed.pending(''));

    expect(state.loading).toBe(true);
  });

  test('Test fetchFeed rejected', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchFeed.rejected(mockErrorResponse, '')
    );

    expect(state.loading).toBe(false);
  });

  test('Test fetchFeed fulfilled', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchFeed.fulfilled(mockFeedResponse, '')
    );

    expect(state.loading).toBe(false);
    expect(state.orders).toEqual(mockFeedResponse.orders);
    expect(state.totalOrders).toEqual(mockFeedResponse.total);
    expect(state.ordersToday).toEqual(mockFeedResponse.totalToday);
  });

  test('Test fetchUserOrders pending', () => {
    const state = stellarBurgerSlice(initialState, fetchUserOrders.pending(''));

    expect(state.loading).toBe(true);
  });

  test('Test fetchUserOrders rejected', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchUserOrders.rejected(mockErrorResponse, '')
    );

    expect(state.loading).toBe(false);
  });

  test('Test fetchUserOrders fulfilled', () => {
    const mockResponse = [mockOrderResponse.order];
    const state = stellarBurgerSlice(
      initialState,
      fetchUserOrders.fulfilled(mockResponse, '')
    );

    expect(state.loading).toBe(false);
    expect(state.userOrders).toEqual(mockResponse);
  });

  test('Test fetchLogout pending', () => {
    const state = stellarBurgerSlice(initialState, fetchLogout.pending(''));

    expect(state.loading).toBe(true);
  });

  test('Test fetchLogout rejected', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchLogout.rejected(mockErrorResponse, '')
    );

    expect(state.loading).toBe(false);
  });

  test('Test fetchLogout fulfilled', () => {
    const mockAnswer = { success: true };
    const state = stellarBurgerSlice(
      initialState,
      fetchLogout.fulfilled(mockAnswer, '')
    );

    expect(state.loading).toBe(false);
    expect(state.user).toEqual({ name: '', email: '' });
    expect(state.isAuthenticated).toBe(false);
  });

  test('Test fetchUpdateUser pending', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchUpdateUser.pending('', { name: 'test' })
    );
    expect(state.loading).toBe(true);
  });

  test('Test fetchUpdateUser rejected', () => {
    const state = stellarBurgerSlice(
      initialState,
      fetchUpdateUser.rejected(mockErrorResponse, '', { name: 'test' })
    );
    expect(state.loading).toBe(false);
  });

  test('Test fetchUpdateUser fulfilled', () => {
    const mockUser = {
      ...mockUserResponse.user,
      email: 'changedEmail@mail.ru'
    };
    const mockResponse = {
      success: true,
      user: mockUser
    };
    const state = stellarBurgerSlice(
      initialState,
      fetchUpdateUser.fulfilled(mockResponse, '', mockUser)
    );

    expect(state.loading).toBe(false);
    expect(state.user).toEqual(mockUser);
  });
});
