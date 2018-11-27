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
struct keybalance
{
	uint64_t id;
	public_key user;
	uint64_t nonce;
	asset balance;
	asset eos;

	uint64_t primary_key() const { return id; }

	EOSLIB_SERIALIZE(keybalance, (id)(user)(nonce)(balance)(eos))
};
typedef multi_index<N(keybalance), keybalance> keybalance_table;

// @abi table namebalance i64
struct namebalance
{
	name id;
	asset balance;
	asset eos;

	uint64_t primary_key() const { return id; }

	EOSLIB_SERIALIZE(namebalance, (id)(balance)(eos))
};
typedef multi_index<N(namebalance), namebalance> namebalance_table;
// @abi table info i64
struct info
{
	uint64_t id;
	name manager;

	uint64_t primary_key() const { return id; }

	EOSLIB_SERIALIZE(info, (id)(manager))
};
typedef multi_index<N(info), info> info_table;

struct st_transfer
{
	account_name from;
	account_name to;
	asset quantity;
	string memo;
};

} // namespace types
