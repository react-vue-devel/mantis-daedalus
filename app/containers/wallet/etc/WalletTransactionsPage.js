// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import WalletTransactionsList from '../../../components/wallet/transactions/WalletTransactionsList';
// import WalletTransactionsSearch from '../../components/wallet/summary/WalletTransactionsSearch';
import WalletNoTransactions from '../../../components/wallet/transactions/WalletNoTransactions';
import VerticalFlexContainer from '../../../components/layout/VerticalFlexContainer';
import type { InjectedProps } from '../../../types/injectedPropsType';

const messages = defineMessages({
  noTransactions: {
    id: 'wallet.transactions.no.transactions',
    defaultMessage: '!!!No transactions',
    description: 'Message shown when wallet has no transactions yet.'
  },
  noTransactionsFound: {
    id: 'wallet.transactions.no.transactions.found',
    defaultMessage: '!!!No transactions found',
    description: 'Message shown when wallet transaction search returns zero results.'
  }
});

@inject('stores', 'actions') @observer
export default class WalletTransactionsPage extends Component {

  static defaultProps = { actions: null, stores: null };
  props: InjectedProps;

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  // _handleSearchInputChange = (value: string, event: Object) => {
  //   this.props.actions.ada.transactions.filterTransactions({ searchTerm: event.target.value });
  // };

  render() {
    const { intl } = this.context;
    const actions = this.props.actions;
    const { /* transactions, */ wallets } = this.props.stores.etc;
    const activeWallet = wallets.active;
    // const {
    //   searchOptions,
    //   searchRequest,
    //   hasAny,
    //   totalAvailable,
    //   filtered,
    // } = transactions;

    // Faked missing data and methods
    const searchOptions = { searchTerm: '', searchLimit: 1000, searchSkip: 5 };
    const searchRequest = { isExecutingFirstTime: false };
    const hasAny = false;
    const totalAvailable = 0;
    const filtered = [];

    // Guard against potential null values
    if (!searchOptions || !activeWallet) return null;

    const { searchLimit, searchTerm } = searchOptions;
    const wasSearched = searchTerm !== '';
    let walletTransactions = null;
    // let transactionSearch = null;
    const noTransactionsLabel = intl.formatMessage(messages.noTransactions);
    const noTransactionsFoundLabel = intl.formatMessage(messages.noTransactionsFound);

    // if (wasSearched || hasAny) {
    //   transactionSearch = (
    //     <div style={{ flexShrink: 0 }}>
    //       <WalletTransactionsSearch
    //         searchTerm={searchTerm}
    //         onChange={this._handleSearchInputChange}
    //       />
    //     </div>
    //   );
    // }

    if (searchRequest.isExecutingFirstTime || hasAny) {
      walletTransactions = (
        <WalletTransactionsList
          transactions={filtered}
          isLoadingTransactions={searchRequest.isExecutingFirstTime}
          hasMoreToLoad={totalAvailable > searchLimit}
          onLoadMore={actions.ada.transactions.loadMoreTransactions.trigger}
          assuranceMode={activeWallet.assuranceMode}
          walletId={activeWallet.id}
        />
      );
    } else if (wasSearched && !hasAny) {
      walletTransactions = <WalletNoTransactions label={noTransactionsFoundLabel} />;
    } else if (!hasAny) {
      walletTransactions = <WalletNoTransactions label={noTransactionsLabel} />;
    }

    return (
      <VerticalFlexContainer>
        {/* transactionSearch */}
        {walletTransactions}
      </VerticalFlexContainer>
    );
  }

}
