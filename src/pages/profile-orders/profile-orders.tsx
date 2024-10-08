import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import {
  fetchUserOrders,
  removeUserOrders,
  selectUserOrders
} from '../../slices/StellarBurgerSlice';
import { Preloader } from '@ui';
import { useAppSelector, useAppDispatch } from '../../services/store';

export const ProfileOrders: FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(removeUserOrders());
    dispatch(fetchUserOrders());
  }, []);
  const orders = useAppSelector(selectUserOrders);

  if (!orders) {
    return <Preloader />;
  }

  return <ProfileOrdersUI orders={orders} />;
};
