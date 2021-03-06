// @flow
import { observable, action, computed, runInAction, untracked } from 'mobx';
import Store from './lib/Store';
import Wallet from '../domain/Wallet';
import Request from './lib/LocalizedRequest';
import { buildRoute, matchRoute } from '../lib/routing-helpers';
import { ROUTES } from '../routes-config';
import WalletAddDialog from '../components/wallet/WalletAddDialog';

/**
 * The base wallet store that contains the shared logic
 * dealing with wallets / accounts.
 */

export default class WalletsStore extends Store {

  WALLET_REFRESH_INTERVAL = 5000;

  @observable active: ?Wallet = null;
  @observable walletsRequest: Request<any>;

  _newWalletDetails: { name: string, mnemonic: string, password: ?string } = {
    name: '',
    mnemonic: '',
    password: null,
  };

  setup() {
    setInterval(this._pollRefresh, this.WALLET_REFRESH_INTERVAL);
    this.registerReactions([
      this._updateActiveWalletOnRouteChanges,
    ]);
  }

  // =================== PUBLIC API ==================== //

  // GETTERS

  @computed get hasActiveWallet(): boolean {
    return !!this.active;
  }

  @computed get hasLoadedWallets(): boolean {
    return this.walletsRequest.wasExecuted;
  }

  @computed get hasAnyWallets(): boolean {
    if (this.walletsRequest.result == null) return false;
    return this.walletsRequest.wasExecuted && this.walletsRequest.result.length > 0;
  }

  @computed get all(): Array<Wallet> {
    return this.walletsRequest.result ? this.walletsRequest.result : [];
  }

  @computed get first(): ?Wallet {
    return this.all.length > 0 ? this.all[0] : null;
  }

  @computed get hasAnyLoaded(): boolean {
    return this.all.length > 0;
  }

  @computed get activeWalletRoute(): ?string {
    if (!this.active) return null;
    return this.getWalletRoute(this.active.id);
  }

  getWalletById = (id: string): (?Wallet) => this.all.find(w => w.id === id);

  getWalletByName = (name: string): (?Wallet) => this.all.find(w => w.name === name);

  getWalletRoute = (walletId: string, page: string = 'summary'): string => (
    buildRoute(ROUTES.WALLETS.PAGE, { id: walletId, page })
  );

  // ACTIONS

  @action refreshWalletsData = () => this.walletsRequest.execute();

  @action _setActiveWallet = ({ walletId }: { walletId: string }) => {
    if (this.hasAnyWallets) {
      this.active = this.all.find(wallet => wallet.id === walletId);
    }
  };

  @action _unsetActiveWallet = () => { this.active = null; };

  goToWalletRoute(walletId: string) {
    const route = this.getWalletRoute(walletId);
    this.actions.router.goToRoute.trigger({ route });
  }

  // =================== PRIVATE API ==================== //

  @computed get _canRedirectToWallet(): boolean {
    const currentRoute = this.stores.app.currentRoute;
    const isRootRoute = matchRoute(ROUTES.WALLETS.ROOT, currentRoute);
    const isNoWalletsRoute = matchRoute(ROUTES.NO_WALLETS, currentRoute);
    return isRootRoute || isNoWalletsRoute;
  }

  _pollRefresh = async () => (
    this.stores.networkStatus.isSynced && await this.refreshWalletsData()
  );

  _toggleAddWalletDialogOnWalletsLoaded = () => {
    if (this.hasLoadedWallets && !this.hasAnyWallets) {
      this.actions.dialogs.open.trigger({ dialog: WalletAddDialog });
    } else if (untracked(() => this.stores.uiDialogs.isOpen(WalletAddDialog))) {
      this.actions.dialogs.closeActiveDialog.trigger();
    }
  };

  _updateActiveWalletOnRouteChanges = () => {
    const currentRoute = this.stores.app.currentRoute;
    const hasAnyWalletLoaded = this.hasAnyLoaded;
    runInAction('WalletsStore::_updateActiveWalletOnRouteChanges', () => {
      // There are not wallets loaded (yet) -> unset active and return
      if (!hasAnyWalletLoaded) return this._unsetActiveWallet();
      const match = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
      if (match) {
        // We have a route for a specific wallet -> lets try to find it
        const walletForCurrentRoute = this.all.find(w => w.id === match.id);
        if (walletForCurrentRoute) {
          // The wallet exists, we are done
          this._setActiveWallet({ walletId: walletForCurrentRoute.id });
        } else if (hasAnyWalletLoaded) {
          // There is no wallet with given id -> pick first wallet
          this._setActiveWallet({ walletId: this.all[0].id });
          if (this.active) this.goToWalletRoute(this.active.id);
        }
      } else if (this._canRedirectToWallet) {
        // The route does not specify any wallet -> pick first wallet
        if (!this.hasActiveWallet && hasAnyWalletLoaded) {
          this._setActiveWallet({ walletId: this.all[0].id });
        }
        if (this.active) this.goToWalletRoute(this.active.id);
      }
    });
  };

}
