import { Context, u128 } from "near-sdk-as";
import { Charity, Donator } from "./model";

// Create Charity With Description and Desired Amount
export function createCharity(description: string, maxAmount: u128): Charity {

  return Charity.openCharity(Context.sender, description, maxAmount);
}

// Get Charity By Id
export function getCharitById(id: u32): Charity {

  return Charity.findCharityById(id);
}

// Get Charities
export function getCharities(start: u32, limit: u32): Charity[] {

  return Charity.findCharities(start, limit);
}

// Donate The Attached Deposit
export function donateCharity(id: u32, message: string): Charity{

  return Charity.addAmount(id, message, Context.attachedDeposit);
}

// Close or Cancel The Charity
export function endCharity(id: u32): Charity{

  return Charity.closeCharity(getCharitById(id), Context.sender);
}

// From Blockchain Look For Latest Donations
export function LatestDonations(start: u32, limit: u32): Donator[] {

  return Donator.showLatestDonations(start, limit);
}