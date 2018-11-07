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

// @abi table usrbalance i64
struct usrbalance
{
	uint64_t id;
	public_key user;
	uint64_t nonce;
	asset balance;
	asset eos;

	uint64_t primary_key() const { return id; }

	EOSLIB_SERIALIZE(usrbalance, (id)(user)(nonce)(balance)(eos))
};
typedef multi_index<N(usrbalance), usrbalance> usrbalance_table;

// @abi table test i64
struct test
{
	uint64_t id;
	std::vector<int8_t> key;

	uint64_t primary_key() const { return id; }

	EOSLIB_SERIALIZE(test, (id)(key))
};
typedef multi_index<N(test), test> test_table;

struct transfer_st
{
	public_key from;
	public_key to;
	asset amount;
	string memo;
	uint64_t nonce;
};

struct st_transfer
{
	account_name from;
	account_name to;
	asset quantity;
	string memo;
};

} // namespace types
