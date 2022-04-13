import { Context, PersistentUnorderedMap,  math, u128, ContractPromiseBatch } from "near-sdk-as";

// Create Blockchain Databases (Key, Value)
export const charities = new PersistentUnorderedMap<u32, Charity>("charities");
export const donators = new PersistentUnorderedMap<u32, Donator>("donators");

@nearBindgen
export class Charity {

    id: u32; // Id of Charity
    owner: string = Context.sender;
    description: string; // Description Of Charity
    amount: u128; // Total Amount Collected
    maxAmount: u128; // Amount To Achieve
    complete: bool; // Is Charity Completed ?
    latestDonation: Donator; // Last Donation To Charity?

    constructor(owner: string, description: string, maxAmount: u128) {

        this.id = math.hash32<string>(owner);
        this.owner = owner;
        this.description = description;
        this.maxAmount = maxAmount;
        this.amount = new u128(0);
        this.complete = false;

    }

/********************
    Call Methods
*********************/

    // Create The Charity
    static openCharity(owner: string, description: string, maxAmount: u128): Charity {

        // Whether Owner Has Another Open Charity ?
        this.assert_owner_has_charity(math.hash32<string>(owner));
        const charity = new Charity(owner, description, maxAmount);

        // Push Charity To Blockchain Data
        charities.set(charity.id, charity);

        return charity;
    }

    // Donation
    static addAmount(id:u32, message: string, amount: u128): Charity {

        // Find The Charity Of Interest
        const charity = this.findCharityById(id);

        // Add The Attached Deposit To The Fund
        charity.amount = u128.add(charity.amount, amount);

        // From Donator Class Obtain The Necessary Data Structure
        const donator = new Donator(id, message, amount);

        // Save Latest Donation To The Charity
        charity.latestDonation = donator;

        // Push Charity and Donator To Blockchain Data
        charities.set(id, charity);
        donators.set(donators.length + 1, donator);

        return charity

    }

    // Close or Cancel Charity. Either Way The Collected Money Returns To The Owner.
    static closeCharity(charity: Charity, caller: string): Charity{
        
        // Is Caller Owner ?
        this.assert_owner(charity, caller);
        
        // Transfer Total Fund To The Owner
        const owner_call = ContractPromiseBatch.create(caller);
        owner_call.transfer(charity.amount);

        // In Blockchain Data Update The Remaining Amount And Complete Status
        charity.amount = new u128(0);
        charity.complete = true;

        // Push Charity To Blockchain Data
        charities.set(charity.id, charity);

        return charity

    }

/********************
    View Methods
*********************/

    // Find The Charity From Blockchain
    static findCharityById(id:u32): Charity {

        return charities.getSome(id);

    }

    // Find The Charities Between (Offset, Offset + Limit)
    static findCharities(offset: u32, limit: u32 = 10): Charity[] {

        return charities.values(offset, limit + offset);

    }

/********************
    Private Methods
*********************/

    // Is Owner Has Another Charity ?
    static assert_owner_has_charity(id: u32): void {

        const charity = this.findCharityById(id);

        // Is Owner's Other Charity Completed ?
        if (charity.complete != true) {
            
            assert(!charities.contains(id), 'Owner has another charity !!');
            
        }

    }

    // Is Caller The Owner ?
    static assert_owner(charity: Charity, caller: string): void {

        assert(charity.owner == caller, 'Only owner can call this function !!');
    }
}

@nearBindgen
export class Donator {

    message: string;
    donation: u128;
    charityId: u32;

    constructor(charityId: u32, message: string, donation: u128) {
        
        this.charityId = charityId;
        this.message = message;
        this.donation = donation;
    }

/********************
    View Methods
*********************/
    static showLatestDonations(offset:u32, limit: u32 = 10): Donator[] {

        return donators.values(offset, limit + offset)
    }

}