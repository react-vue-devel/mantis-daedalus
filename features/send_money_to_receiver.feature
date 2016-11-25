Feature: Send Money to Receiver

  Background:
    Given I have an account
    And I have a wallet

  Scenario: User Submits Empty Form
    Given I am on the wallet send screen
    When I submit the wallet send form
    Then I should see the following error messages on the wallet send form:
    # TODO: use translation IDs for these examples instead
    | message                               |
    | Please enter a valid Bitcoin address. |
    | Please enter a valid amount.          |