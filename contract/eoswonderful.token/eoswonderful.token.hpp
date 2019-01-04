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
