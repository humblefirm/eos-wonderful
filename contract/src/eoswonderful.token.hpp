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

// @abi table keybalance i64
struct [[eosio::table]] accounts
{
	uint64_t id;
	public_key user;
	uint64_t nonce;
	asset balance;

	uint64_t primary_key() const { return id; }

	EOSLIB_SERIALIZE(accounts, (id)(user)(nonce)(balance))
};
typedef multi_index<"accounts"_n, accounts> accounts_table;

// @abi table info i64
struct [[eosio::table]] info
{
	uint64_t id;
	name manager;

	uint64_t primary_key() const { return id; }

	EOSLIB_SERIALIZE(info, (id)(manager))
};
typedef multi_index<"info"_n, info> info_table;

struct st_transfer
{
	name from;
	name to;
	asset quantity;
	string memo;
};

struct st_transfer2
{
	public_key from;
	public_key to;
	asset amount;
	string memo;
	asset fee;
	signature sig;
	name sa;
};

} // namespace types
