#include <string>
#include <eosiolib/asset.hpp>
#include <eosiolib/eosio.hpp>
#include <eosiolib/crypto.h>
#include <vector>
#include <super.token.hpp>
#include <eosiolib/time.hpp>

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
	uint64_t transfer_fee = 10000;
	uint64_t feeRstTime = 8 * HOUR * 1000 * 1000;
	void create(public_key owner, asset amount)
	{
		require_auth2(_self, N(active));
		eosio_assert(amount.symbol == string_to_symbol(4, "WDF"),
    "only accepts WDF");
		asset new_balance;

		usrbalance_table usrbalance(_self, _self);
		auto itr_balance = usrbalance.find(keytoid(owner));
		if (itr_balance != usrbalance.end())
		{
			usrbalance.modify(itr_balance, _self, [&](auto &r) {
				r.balance = amount;
				r.fee += amount - amount;
				r.lastclaim = 0;
			});
		}
		else
		{

			usrbalance.emplace(_self, [&](auto &r) {
				r.id = keytoid(owner);
				r.user = owner;
				r.nonce = 0;
				r.balance = amount;
				r.fee = amount - amount;
				r.lastclaim = 0;
			});
		}
	}
	void change(public_key owner, asset amount)
	{
		require_auth2(_self, N(active));
		eosio_assert(amount.symbol == string_to_symbol(4, "WDF"),
    "only accepts WDF");
		asset new_balance;

		usrbalance_table usrbalance(_self, _self);
		auto itr_balance = usrbalance.find(keytoid(owner));
		eosio_assert(itr_balance != usrbalance.end(), "Account doesn't exist");
		usrbalance.modify(itr_balance, _self, [&](auto &r) {
			r.balance = amount;
			r.fee += amount - amount;
			r.lastclaim = 0;
		});
	}
	void remove(public_key owner)
	{
		require_auth2(_self, N(active));
		asset new_balance;

		usrbalance_table usrbalance(_self, _self);
		auto itr_balance = usrbalance.find(keytoid(owner));
		eosio_assert(itr_balance != usrbalance.end(), "Account doesn't exist");
		usrbalance.erase(itr_balance);
	}
	void removest()
	{
		require_auth2(_self, N(active));
		globalstate_table globalstate(_self, _self);
		auto itr_state = globalstate.find(0);

		globalstate.erase(itr_state);
	}

	void mint(string from, public_key key, asset amount, string memo)
	{
		require_auth2(_self, N(active));
		eosio_assert(amount.symbol == string_to_symbol(4, "WDF"),
    "only accepts WDF");


		bool newaccount = false;
		usrbalance_table usrbalance(_self, _self);
		auto itr_balance = usrbalance.find(keytoid(key));
		if (itr_balance != usrbalance.end())
		{
			usrbalance.modify(itr_balance, _self, [&](auto &r) {
				r.balance += amount;
			});
		}
		else
		{
			newaccount = true;
			usrbalance.emplace(_self, [&](auto &r) {
				r.id = keytoid(key);
				r.user = key;
				r.nonce = 0;
				r.balance = amount;
				r.fee = amount - amount;
				r.lastclaim = 0;
			});
		}


		globalstate_table globalstate(_self, _self);
		auto itr_state = globalstate.find(0);

		if (itr_state != globalstate.end())
		{
			//globalstate.erase(itr_state);
			globalstate.modify(itr_state, _self, [&](auto &r) {
				r.total_issued.amount += amount.amount;
				r.total_volume.amount += amount.amount;
			});
		}
		else
		{
			globalstate.emplace(_self, [&](auto &r) {
				r.id = 0;
				r.total_issued = amount;
				r.total_volume = amount;
				r.transfer_volume = amount - amount;
				r.transfer_count = 0;
				r.avg_delay_transfer = 0;
			});
		}
	}

	void transfer(public_key sender, public_key receiver, asset amount, string memo, signature sig)
	{
		require_auth2(_self, N(pub));
		eosio_assert(amount.symbol == string_to_symbol(4, "WDF"),
    "only accepts WDF");
		eosio_assert(amount.amount > 0, "must transfer positive quantity");
		eosio_assert(memo.size() <= 256, "memo has more than 256 bytes");
		eosio_assert(amount.is_valid(), "invalid quantity");

		usrbalance_table usrbalance(_self, _self);
		auto from = usrbalance.find(keytoid(sender));

		eosio_assert(from != usrbalance.end(), "no account found");
		eosio_assert(from->balance.amount + from->fee.amount >= amount.amount, "overdrawn balance");
		eosio_assert(from->balance.amount + from->fee.amount >= transfer_fee, "not enough balance for transfer fee");

		transfer_st datas;
		datas.amount = amount;
		datas.memo = memo;
		datas.sender = sender;
		datas.receiver = receiver;
		datas.nonce = from->nonce;
		//need recovery and verrify sig
		checksig(datas, sig);
		uint64_t now = current_time();
		uint64_t delay = 0;
		//send money
		usrbalance.modify(from, _self, [&](auto &r) {
			//수수료 환원
			delay = now - r.lastclaim;
			int64_t refund = (now / 100000 - r.lastclaim / 100000) * r.fee.amount / (feeRstTime / 100000);
			if (refund > r.fee.amount)
				refund = r.fee.amount;
			r.balance.amount += refund;
			r.fee.amount -= refund;
			eosio_assert(r.balance.amount >= amount.amount + transfer_fee, "Too much transfer, Please try again in a few hours");

			//수수료 부과
			r.balance.amount -= transfer_fee;
			r.fee.amount += transfer_fee;

			r.balance.amount -= amount.amount;
			r.lastclaim = now;
			r.nonce++;
		});

		auto to = usrbalance.find(keytoid(receiver));
		bool newaccount = false;
		if (to != usrbalance.end())
		{
			usrbalance.modify(to, _self, [&](auto &r) {
				r.balance.amount += amount.amount;
			});
		}
		else
		{
			newaccount = true;
			usrbalance.emplace(_self, [&](auto &r) {
				r.id = keytoid(receiver);
				r.user = receiver;
				r.nonce = 0;
				r.balance = amount;
				r.fee = amount - amount;

				r.lastclaim = 0;
			});
		}

		globalstate_table globalstate(_self, _self);
		auto itr_state = globalstate.find(0);
		int transfer_count;
		globalstate.modify(itr_state, _self, [&](auto &r) {
			r.transfer_volume.amount += amount.amount;
			if(delay!=now)
			r.avg_delay_transfer = (r.avg_delay_transfer * r.transfer_count + delay) / (r.transfer_count + 1);
			r.transfer_count += 1;
		});

		print("complete!");
	}

	void verify(public_key sender, public_key receiver, asset amount, string memo, signature sig)
	{
		string str;
		int i;
		checksum256 digest;
		char potato[34 * 2 + 8 + 256 + 8];

		usrbalance_table usrbalance(_self, _self);
		auto from = usrbalance.find(keytoid(sender));

		transfer_st datas;
		datas.sender = sender;
		datas.receiver = receiver;
		datas.amount = amount;
		datas.memo = memo;
		datas.nonce = from->nonce;

		memcpy(potato, &datas.sender, sizeof(datas.sender));
		memcpy(potato + 34, &datas.receiver, sizeof(datas.receiver));
		memcpy(potato + 34 + 34, &datas.amount.amount, sizeof(datas.amount.amount));
		memcpy(potato + 34 + 34 + 8, &datas.memo, sizeof(datas.memo));
		memcpy(potato + 34 + 34 + 8 + 256, &datas.nonce, sizeof(datas.nonce));
		for (i = 0; i < sizeof(potato); i++)
			str.append(std::to_string(potato[i]));

		//sha256(const_cast<char *>(str.c_str()), str.size(), &digest);
		sha256(potato, sizeof(potato), &digest);

		data_table tablek(_self, _self);
		auto itr_balance = tablek.find(keytoid(sender));
		if (itr_balance != tablek.end())
		{
			tablek.modify(itr_balance, _self, [&](auto &r) {
				r.digest = digest;
				r.pk = sender;
				r.sig = sig;
				r.data = datas;
				r.merge = str;
			});
		}
		else
		{
			tablek.emplace(_self, [&](auto &r) {
				r.id = keytoid(sender);
				r.digest = digest;
				r.pk = sender;
				r.sig = sig;
				r.data = datas;
				r.merge = str;
			});
		}
		//assert_recover_key(&digest, (const char *)&sig, sizeof(sig), (const char *)&sender, sizeof(sender));
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
	uint32_t my_strlen(const char *str)
	{
		uint32_t len = 0;
		while (str[len])
			++len;
		return len;
	}
	string datatostr(transfer_st data)
	{
		char ret[sizeof(data) + 1];
		memcpy(ret, &data.sender, sizeof data.sender);
		memcpy(ret + sizeof data.sender, &data.receiver, sizeof data.receiver);
		memcpy(ret + sizeof data.sender + sizeof data.receiver, &data.amount, sizeof data.amount);
		memcpy(ret + sizeof data.sender + sizeof data.receiver + sizeof data.amount, &data.memo, 8);
		return (string)ret;
	}
	void checksig(transfer_st datas, signature sig)
	{
		int i;
		checksum256 digest;
		char potato[34 * 2 + 8 + 256 + 8];

		memcpy(potato, &datas.sender, sizeof(datas.sender));
		memcpy(potato + 34, &datas.receiver, sizeof(datas.receiver));
		memcpy(potato + 34 + 34, &datas.amount.amount, sizeof(datas.amount.amount));
		memcpy(potato + 34 + 34 + 8, &datas.memo, sizeof(datas.memo));
		memcpy(potato + 34 + 34 + 8 + 256, &datas.nonce, sizeof(datas.nonce));

		//sha256(const_cast<char *>(str.c_str()), str.size(), &digest);
		sha256(potato, sizeof(potato), &digest);

		/*checksum256 digest;
		string str;
		str.append(std::to_string(keytoid(datas.sender)));
		str.append(std::to_string(keytoid(datas.receiver)));
		str.append(std::to_string(datas.amount.amount));
		str.append(datas.memo);
		sha256(const_cast<char *>(str.c_str()), str.size(), &digest);
*/
		assert_recover_key(&digest, (const char *)&sig, sizeof(sig), (const char *)&datas.sender, sizeof(datas.sender));
	}
};
EOSIO_ABI(token, (create)(change)(remove)(removest)(mint)(transfer)(verify))
