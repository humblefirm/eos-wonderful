#include <string>
#include <eosiolib/asset.hpp>
#include <eosiolib/eosio.hpp>
#include <eosiolib/crypto.h>
#include <vector>
#include <super.token.hpp>
#include <eosiolib/time.hpp>
#include <eosiolib/print.h>

using namespace eosio;
using namespace std;
using namespace types;
class token : public contract
{
  public:
	token(account_name self)
		: contract(self)
	{
	}

	void mint(public_key to, asset amount, string memo)
	{
		//함수 작동 흐름
		//사용자 및 정합성 체크
		//
		require_auth2(_self, N(active));
		asset fee = amount - amount;
		VerifyCheck(amount, memo, fee);

		usrbalance_table usrbalance(_self, _self);
		auto itr_balance = usrbalance.find(keytoid(to));
		if (itr_balance != usrbalance.end())
		{
			usrbalance.modify(itr_balance, _self, [&](auto &r) {
				r.balance += amount;
			});
		}
		else
		{
			usrbalance.emplace(_self, [&](auto &r) {
				r.id = keytoid(to);
				r.user = to;
				r.nonce = 0;
				r.balance = amount;
				r.eos = amount - amount;
				r.eos.symbol = string_to_symbol(4, "EOS");
			});
		}
	}

	void createkey(public_key creator, public_key key, string memo, asset fee, signature sig, public_key sa)
	{
		//함수 작동 흐름
		//사용자 및 정합성 체크
		//1코인 지불해야함
		eosio_assert(fee.symbol == string_to_symbol(4, "WDF"),
					 "only accepts WDF for fee");
		eosio_assert(fee.is_valid(), "Invalid token transfer");
		eosio_assert(fee.amount >= 0, "Quantity must be positive");

		usrbalance_table usrbalance(_self, _self);
		auto creater = usrbalance.find(keytoid(creator));
		auto creating = usrbalance.find(keytoid(key));
		auto miner = usrbalance.find(keytoid(sa));

		uint64_t nonce = creater->nonce;
		CheckSigCreateKey(creator, key, memo, fee, nonce, sig);
		eosio_assert(creater->balance.amount >= 10000 + fee.amount, "Overdrawn balance");
		//송금자 돈 -
		eosio_assert(creater != usrbalance.end(), "Account not found! please make new account");
		usrbalance.modify(creater, _self, [&](auto &r) {
			r.balance.amount -= 10000 + fee.amount;
			r.nonce++;
		});

		//키 생성
		eosio_assert(creating == usrbalance.end(), "Key already exists");
		usrbalance.emplace(_self, [&](auto &r) {
			r.id = keytoid(key);
			r.user = key;
			r.nonce = 0;
			r.balance = fee - fee;
			r.eos = fee - fee;
			r.eos.symbol = string_to_symbol(4, "EOS");
		});

		//처리자 돈 +
		eosio_assert(miner != usrbalance.end(), "Service-Account not found! please make new account");
		usrbalance.modify(miner, _self, [&](auto &r) {
			r.balance.amount += fee.amount;
		});
	}
	void transfer(public_key from, public_key to, asset amount, string memo, asset fee, signature sig, public_key sa)
	{
		//함수 작동 흐름
		//정합성 체크
		//시그니쳐 체크
		//송금자 돈 -
		//입금자 돈 +
		//처리자 돈 +
		//처리자 로그 (SA평판 및 횟수/총 수수료)

		//정합성 체크
		usrbalance_table usrbalance(_self, _self);
		auto sender = usrbalance.find(keytoid(from));
		auto receiver = usrbalance.find(keytoid(to));
		auto miner = usrbalance.find(keytoid(sa));

		VerifyCheck(amount, memo, fee);
		eosio_assert(sender->balance.amount >= amount.amount + fee.amount, "Overdrawn balance");

		//시그니쳐 체크
		transfer_st datas;
		datas.from = from;
		datas.to = to;
		datas.amount = amount;
		datas.memo = memo;
		datas.nonce = sender->nonce;
		CheckSigTransfer(datas, fee, sig);

		//송금자 돈 -
		eosio_assert(sender != usrbalance.end(), "Account not found! please make new account");
		usrbalance.modify(sender, _self, [&](auto &r) {
			r.balance.amount -= amount.amount + fee.amount;
			r.nonce++;
		});

		//처리자 돈 +
		eosio_assert(miner != usrbalance.end(), "Service-Account not found! please make new account");
		usrbalance.modify(miner, _self, [&](auto &r) {
			r.balance.amount += fee.amount;
		});

		//입금자 돈 +
		eosio_assert(receiver != usrbalance.end(), "Receiver-Account not found! please make new account");
		usrbalance.modify(receiver, _self, [&](auto &r) {
			r.balance.amount += amount.amount;
		});

		/* make new account
			usrbalance.emplace(_self, [&](auto &r) {
				r.id = keytoid(to);
				r.user = to;
				r.nonce = 0;
				r.balance = amount;
			});
		*/

		print("complete!");
	}
	void deposit(uint64_t sender, uint64_t receiver)
	{
		auto transfer_data = unpack_action_data<st_transfer>();
		if (transfer_data.from == _self || transfer_data.to != _self)
		{
			return;
		}

		eosio_assert(transfer_data.quantity.symbol == string_to_symbol(4, "EOS"),
					 "only accepts EOS for deposits");
		eosio_assert(transfer_data.quantity.is_valid(), "Invalid token transfer");
		eosio_assert(transfer_data.quantity.amount > 0, "Quantity must be positive");

		usrbalance_table usrbalance(_self, _self);
		auto key = usrbalance.find(fast_atoi(transfer_data.memo.c_str()));

		//입금자 돈 +
		if (key != usrbalance.end())
			usrbalance.modify(key, _self, [&](auto &r) {
				r.eos.amount += transfer_data.quantity.amount;
			});
	}
	void withdraw(public_key from, account_name to, asset amount, string memo, asset fee, signature sig, public_key sa)
	//void withdraw(account_name memo)
	{
		/*char strchar[8];
		memcpy(strchar, &memo, sizeof(strchar));
		printhex(strchar,8);
		
		char data2[256];
		checksum256 digest = name2chksum(memo);
		memcpy(data2, &digest, sizeof(digest));
		printhex(data2, sizeof(digest));*/

		eosio_assert(amount.symbol == string_to_symbol(4, "EOS"),
					 "only accepts EOS for deposits");
		eosio_assert(amount.is_valid(), "Invalid token transfer");
		eosio_assert(amount.amount > 0, "Quantity must be positive");

		eosio_assert(fee.symbol == string_to_symbol(4, "WDF"),
					 "only accepts WDF for fee");
		eosio_assert(fee.is_valid(), "Invalid token transfer");
		eosio_assert(fee.amount >= 0, "Quantity must be positive");

		usrbalance_table usrbalance(_self, _self);
		auto sender = usrbalance.find(keytoid(from));
		auto miner = usrbalance.find(keytoid(sa));

		uint64_t nonce = sender->nonce;
		CheckSigWithdraw(from, to, amount, memo, fee, nonce, sig);
		eosio_assert(sender->eos >= amount, "Not enough eos");
		eosio_assert(sender->balance.amount >= fee.amount, "Overdrawn balance");

		//송금자 돈 -
		eosio_assert(sender != usrbalance.end(), "Account not found! please make new account");
		usrbalance.modify(sender, _self, [&](auto &r) {
			r.eos -= amount;
			r.balance.amount -= fee.amount;
			r.nonce++;
		});

		//처리자 돈 +
		eosio_assert(miner != usrbalance.end(), "Service-Account not found! please make new account");
		usrbalance.modify(miner, _self, [&](auto &r) {
			r.balance.amount += fee.amount;
		});
		//입금자 돈 +
		action(
			permission_level{_self, N(active)},
			N(eosio.token),
			N(transfer),
			std::make_tuple(
				_self,
				to,
				amount,
				memo))
			.send();
	}

  private:
	uint64_t keytoid(public_key key)
	{
		uint64_t ret = 0;
		int i = 0;
		for (; i < 6; i++)
		{
			int a = key.data[i + 1];
			a = a < 0 ? 256 + a : a;
			ret += a << (i * 4);
		}
		return ret;
	}
	int fast_atoi(const char *str)
	{
		int val = 0;
		while (*str)
		{
			val = val * 10 + (*str++ - '0');
		}
		return val;
	}
	void CheckSigWithdraw(public_key from, account_name to, asset amount, string memo, asset fee, uint64_t nonce, signature sig)
	{
		char strchar[256];
		strncpy(strchar, memo.c_str(), sizeof(strchar));
		strchar[sizeof(strchar) - 1] = 0;

		checksum256 digest;
		char potato[34 + 8 * 3 + 256];

		memcpy(potato, &from, sizeof(from));
		memcpy(potato + 34, &to, sizeof(to));
		memcpy(potato + 34 + 8, &amount.amount, sizeof(amount.amount));
		memcpy(potato + 34 + 8 + 8, &strchar, sizeof(strchar));
		memcpy(potato + 34 + 8 + 8 + 256, &fee.amount, sizeof(fee.amount));
		memcpy(potato + 34 + 8 + 8 + 256 + 8, &nonce, sizeof(nonce));

		sha256(potato, sizeof(potato), &digest);

		assert_recover_key(&digest, (const char *)&sig, sizeof(sig), (const char *)&from, sizeof(from));
	}
	void CheckSigTransfer(transfer_st datas, asset fee, signature sig)
	{

		char strchar[256];
		strncpy(strchar, datas.memo.c_str(), sizeof(strchar));
		strchar[sizeof(strchar) - 1] = 0;

		checksum256 digest;
		char potato[34 * 2 + 8 + 256 + 8 + 8];

		memcpy(potato, &datas.from, sizeof(datas.from));
		memcpy(potato + 34, &datas.to, sizeof(datas.to));
		memcpy(potato + 34 + 34, &datas.amount.amount, sizeof(datas.amount.amount));
		memcpy(potato + 34 + 34 + 8, &strchar, sizeof(strchar));
		memcpy(potato + 34 + 34 + 8 + 256, &fee.amount, sizeof(fee.amount));
		memcpy(potato + 34 + 34 + 8 + 256 + 8, &datas.nonce, sizeof(datas.nonce));

		sha256(potato, sizeof(potato), &digest);

		assert_recover_key(&digest, (const char *)&sig, sizeof(sig), (const char *)&datas.from, sizeof(datas.from));
	}
	void CheckSigCreateKey(public_key creator, public_key key, string memo, asset fee, uint64_t nonce, signature sig)
	{

		char strchar[256];
		strncpy(strchar, memo.c_str(), sizeof(strchar));
		strchar[sizeof(strchar) - 1] = 0;

		checksum256 digest;
		char potato[34 * 2 + 256 + 8 + 8];

		memcpy(potato, &creator, sizeof(creator));
		memcpy(potato + 34, &key, sizeof(key));
		memcpy(potato + 34 + 34, &strchar, sizeof(strchar));
		memcpy(potato + 34 + 34 + 256, &fee.amount, sizeof(fee.amount));
		memcpy(potato + 34 + 34 + 256 + 8, &nonce, sizeof(nonce));
		//printhex(potato, sizeof(potato));
		sha256(potato, sizeof(potato), &digest);

		//char data2[256];
		//memcpy(data2, &digest, sizeof(digest));
		//printhex(data2, sizeof(digest));
		assert_recover_key(&digest, (const char *)&sig, sizeof(sig), (const char *)&creator, sizeof(creator));
	}
	void VerifyCheck(asset amount, string memo, asset fee)
	{
		eosio_assert(memo.size() <= 256, "memo has more than 256 bytes");
		eosio_assert(amount.symbol == string_to_symbol(4, "WDF") && fee.symbol == string_to_symbol(4, "WDF"),
					 "only accepts WDF");
		eosio_assert(amount.is_valid() && fee.is_valid(), "invalid quantity");
		eosio_assert(amount.amount > 0 && fee.amount >= 0, "must transfer positive quantity");
	}
	checksum256 str2chksum(string str)
	{
		checksum256 digest;
		char strchar[256];
		strncpy(strchar, str.c_str(), sizeof(strchar));
		strchar[sizeof(strchar) - 1] = 0;
		sha256(strchar, sizeof(strchar), &digest);
		return digest;
	}
	checksum256 name2chksum(account_name user)
	{
		checksum256 digest;
		char strchar[8];
		memcpy(strchar, &user, sizeof(strchar));
		sha256(strchar, sizeof(strchar), &digest);
		return digest;
	}
};

#undef EOSIO_ABI
#define EOSIO_ABI(TYPE, MEMBERS)                                                                                                 \
	extern "C"                                                                                                                   \
	{                                                                                                                            \
		void apply(uint64_t receiver, uint64_t code, uint64_t action)                                                            \
		{                                                                                                                        \
			auto self = receiver;                                                                                                \
			TYPE thiscontract(self);                                                                                             \
			if (action == N(onerror))                                                                                            \
			{                                                                                                                    \
				/* onerror is only valid if it is for the "eosio" code account and authorized by "eosio"'s "active permission */ \
				eosio_assert(code == N(eosio), "onerror action's are only valid from the \"eosio\" system account");             \
			}                                                                                                                    \
			if (code == self)                                                                                                    \
			{                                                                                                                    \
				if (action != N(deposit))                                                                                        \
				{                                                                                                                \
					switch (action)                                                                                              \
					{                                                                                                            \
						EOSIO_API(TYPE, MEMBERS)                                                                                 \
					}                                                                                                            \
					/* does not allow destructor of thiscontract to run: eosio_exit(0);    */                                    \
				}                                                                                                                \
			}                                                                                                                    \
			else if (code == N(eosio.token) && action == N(transfer))                                                            \
			{                                                                                                                    \
				execute_action(&thiscontract, &token::deposit);                                                                  \
			}                                                                                                                    \
		}                                                                                                                        \
	}

EOSIO_ABI(token, (mint)(transfer)(createkey)(deposit)(withdraw))
