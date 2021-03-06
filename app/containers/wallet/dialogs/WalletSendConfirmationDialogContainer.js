// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import type { StoresMap } from '../../../stores/index';
import type { ActionsMap } from '../../../actions/index';
import WalletSendConfirmationDialog from '../../../components/wallet/WalletSendConfirmationDialog';
import environment from '../../../environment';

@inject('actions', 'stores') @observer
export default class WalletSendConfirmationDialogContainer extends Component {

  static defaultProps = { actions: null, stores: null };

  props: {
    stores: any | StoresMap,
    actions: any | ActionsMap,
    amount: string,
    receiver: string,
    totalAmount: string,
    transactionFee: string,
    amountToNaturalUnits: (amountWithFractions: string) => string,
    currencyUnit: string,
  };

  handleWalletSendFormSubmit = (values: Object) => {
    this.props.actions[environment.API].wallets.sendMoney.trigger(values);
  };

  render() {
    const {
      actions, amount, receiver, totalAmount,
      transactionFee, amountToNaturalUnits, currencyUnit
    } = this.props;
    const { wallets } = this.props.stores[environment.API];
    const { sendMoneyRequest } = wallets;
    const activeWallet = wallets.active;

    if (!activeWallet) throw new Error('Active wallet required for WalletSendPage.');

    return (
      <WalletSendConfirmationDialog
        isWalletPasswordSet={activeWallet.hasPassword}
        amount={amount}
        receiver={receiver}
        totalAmount={totalAmount}
        transactionFee={transactionFee}
        amountToNaturalUnits={amountToNaturalUnits}
        onSubmit={this.handleWalletSendFormSubmit}
        isSubmitting={sendMoneyRequest.isExecuting}
        onCancel={() => {
          actions.dialogs.closeActiveDialog.trigger();
        }}
        error={sendMoneyRequest.error}
        currencyUnit={currencyUnit}
      />
    );
  }

}
