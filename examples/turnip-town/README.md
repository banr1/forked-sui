# Turnip Town

Turnip Town is an end-to-end demo of a simulation game that continues
running when the player is not interacting with it and supports
tradeable NFTs that can be bought and sold through Kiosks, (where the
game publisher receives a royalty on each sale).

## Highlights

The demo illustrates how to:

- **share ownership** between the game, which needs to run the simulation,
  and the player who wants a sense of ownership over their instance of
  the game, using `Deed`s.
- define a transfer policy for in-game assets, to enforce **royalties**.
- architect the game's back-end service to take advantage of Sui's
  **parallelism** and programmable transaction blocks to update the
  simulations across multiple fields, concurrently.
- **query Sui's RPC** to get the necessary information to visualize on the
  front-end.

## Premise

In Turnip Town, players plant fields with turnips and must return to
them daily to ensure they have enough water to grow.  While they are
not playing, the game simulates weather: Rain adds water to the field,
and sunshine allows turnips to use up the water in their fields to
grow.

Players must balance how much water is in the field: Too little water,
and turnips will dry up, too much and they will get water-logged and
rot, becoming less fresh in both cases. With just the right amount of
water, turnips will keep growing, but watch out, because the bigger a
turnip grows, the more water it needs to stay fresh.

## Deploying

TODO

## Possible Extensions

To keep the initial version of the demonstration focussed, the
following possible extensions have not been implemented, but are left
as an exercise for the reader!

 - Defining **Display for Turnips** to illustrate the size and
   freshness of Turnips when viewed from the Explorer.
 - Using **on-chain randomness** to control how much rain and sun a
   field gets, rather than deciding that off-chain in the game
   service.
 - Integrating with a **weather oracle** and augmenting `Field`s with
   a location, so that the `Field` benefits from the real-world
   weather at its location.
 - **Genetics** to add variety to how each turnip responds to the
   weather, and to offer the possibility for cross-pollination and
   breeding.
 - Supporting the **app extension** pattern and generalising `Field`
   so the game can support growing different kinds of produce,
   including "seasonal" produce (only possible to grow at certain,
   restricted times).