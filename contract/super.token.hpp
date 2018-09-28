#pragma once
#include <string>
#include <vector>
#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>
using std::map;
using std::string;
using std::vector;
using namespace eosio;
namespace types
{
typedef uint64_t uuid;
constexpr uint32_t DAY = 86400;
constexpr uint32_t HOUR = 3600;
constexpr uint32_t MINUTE = 60;

struct st_transfer
{
	account_name from;
	account_name to;
	asset quantity;
	string memo;
};

// @abi table globalstate i64
struct globalstate
{
	uint64_t id;
	asset total_issued;
	asset total_volume;
	asset transfer_volume;
	uint64_t transfer_count;
	uint64_t avg_delay_transfer;
	
	uint64_t primary_key() const { return id; }

	EOSLIB_SERIALIZE(globalstate, (id)(total_issued)(total_volume)(transfer_volume)(transfer_count)(avg_delay_transfer))
};
typedef multi_index<N(globalstate), globalstate> globalstate_table;
// @abi table usrbalance i64
struct usrbalance
{
	uint64_t id;
	public_key user;
	uint64_t nonce;
	asset balance;
	asset fee;
	uint64_t lastclaim;


	uint64_t primary_key() const { return id; }

	EOSLIB_SERIALIZE(usrbalance, (id)(user)(nonce)(balance)(fee)(lastclaim))
};
typedef multi_index<N(usrbalance), usrbalance> usrbalance_table;


struct transfer_st
{
	public_key sender;
	public_key receiver;
	asset amount;
	string memo;
	uint64_t nonce;
};
// @abi table tablek i64
struct tablek
{
	uint64_t id;
	checksum256 digest;
	public_key pk;
	signature sig;
	transfer_st data;
	string merge;

	uint64_t primary_key() const { return id; }

	EOSLIB_SERIALIZE(tablek, (id)(digest)(pk)(sig)(data)(merge))
};
typedef multi_index<N(tablek), tablek> data_table;

} // namespace types
