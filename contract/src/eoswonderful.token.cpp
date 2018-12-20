//EOS-Wonderful Token Contract
//https://github.com/humblefirm/eos-wonderful/

//Version 3.0
//Project : Inter-Contract
//Make all eos-wonderful tokens and eos-wonderful contracts interact#include <string>
#include <vector>
#include <iostream>
#include <eoswonderful.token.hpp>
#include <eosiolib/asset.hpp>
#include <eosiolib/eosio.hpp>
#include <eosiolib/crypto.h>

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
	char version = 3;
	//계정 생성 비용 및 설정자 설정
	void setinfo(name manager)
	{
		//id : 설정 및 계좌 관리자
		info_table info(_self, _self);
		auto itr_info = info.find(0);
		if (itr_info == info.end())
		{
			require_auth(_self);
			info.emplace(_self, [&](auto &r) {
				r.id = 0;
				r.manager = manager;
			});
		}
		else
		{
			require_auth(itr_info->manager);
			info.modify(itr_info, _self, [&](auto &r) {
				r.manager = manager;
			});
		}
	}
	void mint(string to, asset amount, string memo)
	{
		if (is_key(to))
			mintk(str_to_pub(to), amount, memo);
		//else
			//mintn(()string_to_name(to.c_str()), amount, memo);
	}

	//토큰 발행 - name
	void mintn(name to, asset amount, string memo)
	{
		//대상자|발행량|메모

		//권한 확인
		info_table info(_self, _self);
		auto itr_info = info.find(0);
		require_auth(itr_info->manager);

		//정확성 확인
		Check_asset(amount, "COF");
		Check_memo(memo);

		//발행
		balance_add(to, amount, itr_info->manager);
	}
	void transferkk(public_key from, public_key to, asset amount, string memo,
					asset fee, signature sig, name sa)
	{
		//송신자|수신자|액수|메모|{sadata}
		require_auth(sa);

		keybalance_table keybalance(_self, _self);
		auto itr_from = keybalance.find(keytoid(from));
		verify_sig_transfer(from, to, amount, memo, fee, itr_from->nonce, sig);
		bool iseos = is_eos(amount);
		Check_memo(memo);

		balance_sub(from, amount, sa, true);
		balance_add(to, amount, sa, false);
	}
	void transferkn(public_key from, name to, asset amount, string memo,
					asset fee, signature sig, name sa)
	{
		//송신자|수신자|액수|메모|{sadata}
		require_auth(sa);

		keybalance_table keybalance(_self, _self);
		auto itr_from = keybalance.find(keytoid(from));
		verify_sig_transfer(from, to, amount, memo, fee, itr_from->nonce, sig);
		bool iseos = is_eos(amount);
		Check_memo(memo);

		balance_sub(from, amount, sa, true);
		if (iseos)
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
		else
			balance_add(to, amount, sa);
	}
	void transfernn(name from, name to, asset amount, string memo)
	{
		//송신자|수신자|액수|메모
		require_auth(from);
		bool iseos = is_eos(amount);
		Check_memo(memo);

		balance_sub(from, amount, from);
		if (iseos)
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
		else
			balance_add(to, amount, from);
	}
	void transfernk(name from, public_key to, asset amount, string memo)
	{
		//송신자|수신자|액수|메모
		require_auth(from);
		bool iseos = is_eos(amount);
		Check_memo(memo);

		balance_sub(from, amount, from);
		balance_add(to, amount, from);
	}

	void income()
	{
		auto transfer_data = unpack_action_data<st_transfer>();
		if (transfer_data.from == _self || transfer_data.to != _self)
		{
			return;
		}

		Check_asset(transfer_data.quantity, "EOS");

		keybalance_table keybalance(_self, _self);
		auto itr_key = keybalance.find(fast_atoi(transfer_data.memo.c_str()));
		namebalance_table namebalance(_self, _self);
		auto itr_name = namebalance.find(eosio::string_to_name(transfer_data.memo.c_str()));
		//입금자 돈 +
		if (itr_key != keybalance.end())
		{
			keybalance.modify(itr_key, _self, [&](auto &r) {
				r.eos.symbol = transfer_data.quantity.symbol;
				r.eos.amount += transfer_data.quantity.amount;
			});
		}
		else if (itr_name != namebalance.end())
		{
			namebalance.modify(itr_name, _self, [&](auto &r) {
				r.eos.symbol = transfer_data.quantity.symbol;
				r.eos.amount += transfer_data.quantity.amount;
			});
		}
		else
			eosio_assert(false, "No Account found");
	}

  private:
	//토큰 발행 - key
	void mintk(public_key to, asset amount, string memo)
	{
		//대상자|발행량|메모

		//권한 확인
		info_table info(_self, _self);
		auto itr_info = info.find(0);
		require_auth(itr_info->manager);

		//정확성 확인
		Check_asset(amount, "COF");
		Check_memo(memo);

		//발행
		balance_add(to, amount, itr_info->manager, false);
	}

	string uint64_string(uint64_t input)
	{
		string result;
		uint8_t base = 10;
		do
		{
			char c = input % base;
			input /= base;
			if (c < 10)
				c += '0';
			else
				c += 'A' - 10;
			result = c + result;
		} while (input);
		return result;
	}

	uint8_t from_hex(char c)
	{
		if (c >= '0' && c <= '9')
			return c - '0';
		if (c >= 'a' && c <= 'f')
			return c - 'a' + 10;
		if (c >= 'A' && c <= 'F')
			return c - 'A' + 10;
		eosio_assert(false, "Invalid hex character");
		return 0;
	}

	size_t from_hex(const string &hex_str, char *out_data, size_t out_data_len)
	{
		auto i = hex_str.begin();
		uint8_t *out_pos = (uint8_t *)out_data;
		uint8_t *out_end = out_pos + out_data_len;
		while (i != hex_str.end() && out_end != out_pos)
		{
			*out_pos = from_hex((char)(*i)) << 4;
			++i;
			if (i != hex_str.end())
			{
				*out_pos |= from_hex((char)(*i));
				++i;
			}
			++out_pos;
		}
		return out_pos - (uint8_t *)out_data;
	}

	string to_hex(const char *d, uint32_t s)
	{
		std::string r;
		const char *to_hex = "0123456789abcdef";
		uint8_t *c = (uint8_t *)d;
		for (uint32_t i = 0; i < s; ++i)
			(r += to_hex[(c[i] >> 4)]) += to_hex[(c[i] & 0x0f)];
		return r;
	}

	string sha256_to_hex(const checksum256 &sha256)
	{
		return to_hex((char *)sha256.hash, sizeof(sha256.hash));
	}

	string sha1_to_hex(const checksum160 &sha1)
	{
		return to_hex((char *)sha1.hash, sizeof(sha1.hash));
	}

	// copied from boost https://www.boost.org/
	template <class T>
	inline void hash_combine(std::size_t &seed, const T &v)
	{
		std::hash<T> hasher;
		seed ^= hasher(v) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
	}

	uint64_t uint64_hash(const string &hash)
	{
		return std::hash<string>{}(hash);
	}

	uint64_t uint64_hash(const checksum256 &hash)
	{
		return uint64_hash(sha256_to_hex(hash));
	}

	checksum256 hex_to_sha256(const string &hex_str)
	{
		eosio_assert(hex_str.length() == 64, "invalid sha256");
		checksum256 checksum;
		from_hex(hex_str, (char *)checksum.hash, sizeof(checksum.hash));
		return checksum;
	}

	checksum160 hex_to_sha1(const string &hex_str)
	{
		eosio_assert(hex_str.length() == 40, "invalid sha1");
		checksum160 checksum;
		from_hex(hex_str, (char *)checksum.hash, sizeof(checksum.hash));
		return checksum;
	}

	size_t sub2sep(const string &input,
				   string *output,
				   const char &separator,
				   const size_t &first_pos = 0,
				   const bool &required = false)
	{
		eosio_assert(first_pos != string::npos, "invalid first pos");
		auto pos = input.find(separator, first_pos);
		if (pos == string::npos)
		{
			eosio_assert(!required, "parse memo error");
			return string::npos;
		}
		*output = input.substr(first_pos, pos - first_pos);
		return pos;
	}

	// Copied from https://github.com/bitcoin/bitcoin

	/** All alphanumeric characters except for "0", "I", "O", and "l" */
	const char *pszBase58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
	const int8_t mapBase58[256] = {
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		0,
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		16,
		-1,
		17,
		18,
		19,
		20,
		21,
		-1,
		22,
		23,
		24,
		25,
		26,
		27,
		28,
		29,
		30,
		31,
		32,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		33,
		34,
		35,
		36,
		37,
		38,
		39,
		40,
		41,
		42,
		43,
		-1,
		44,
		45,
		46,
		47,
		48,
		49,
		50,
		51,
		52,
		53,
		54,
		55,
		56,
		57,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
		-1,
	};

	bool DecodeBase58(const char *psz, std::vector<unsigned char> &vch)
	{
		// Skip leading spaces.
		while (*psz && isspace(*psz))
			psz++;
		// Skip and count leading '1's.
		int zeroes = 0;
		int length = 0;
		while (*psz == '1')
		{
			zeroes++;
			psz++;
		}
		// Allocate enough space in big-endian base256 representation.
		int size = strlen(psz) * 733 / 1000 + 1; // log(58) / log(256), rounded up.
		std::vector<unsigned char> b256(size);
		// Process the characters.
		static_assert(
			sizeof(mapBase58) / sizeof(mapBase58[0]) == 256,
			"mapBase58.size() should be 256"); // guarantee not out of range
		while (*psz && !isspace(*psz))
		{
			// Decode base58 character
			int carry = mapBase58[(uint8_t)*psz];
			if (carry == -1) // Invalid b58 character
				return false;
			int i = 0;
			for (std::vector<unsigned char>::reverse_iterator it = b256.rbegin();
				 (carry != 0 || i < length) && (it != b256.rend());
				 ++it, ++i)
			{
				carry += 58 * (*it);
				*it = carry % 256;
				carry /= 256;
			}
			assert(carry == 0);
			length = i;
			psz++;
		}
		// Skip trailing spaces.
		while (isspace(*psz))
			psz++;
		if (*psz != 0)
			return false;
		// Skip leading zeroes in b256.
		std::vector<unsigned char>::iterator it = b256.begin() + (size - length);
		while (it != b256.end() && *it == 0)
			it++;
		// Copy result into output vector.
		vch.reserve(zeroes + (b256.end() - it));
		vch.assign(zeroes, 0x00);
		while (it != b256.end())
			vch.push_back(*(it++));
		return true;
	}

	bool decode_base58(const string &str, vector<unsigned char> &vch)
	{
		return DecodeBase58(str.c_str(), vch);
	}

	// Copied from https://github.com/bitcoin/bitcoin

	signature str_to_sig(const string &sig, const bool &checksumming = true)
	{
		const auto pivot = sig.find('_');
		eosio_assert(pivot != string::npos, "No delimiter in signature");
		const auto prefix_str = sig.substr(0, pivot);
		eosio_assert(prefix_str == "SIG", "Signature Key has invalid prefix");
		const auto next_pivot = sig.find('_', pivot + 1);
		eosio_assert(next_pivot != string::npos, "No curve in signature");
		const auto curve = sig.substr(pivot + 1, next_pivot - pivot - 1);
		eosio_assert(curve == "K1" || curve == "R1", "Incorrect curve");
		const bool k1 = curve == "K1";
		auto data_str = sig.substr(next_pivot + 1);
		eosio_assert(!data_str.empty(), "Signature has no data");
		vector<unsigned char> vch;

		eosio_assert(decode_base58(data_str, vch), "Decode signature failed");

		eosio_assert(vch.size() == 69, "Invalid signature");

		if (checksumming)
		{
			array<unsigned char, 67> check_data;
			copy_n(vch.begin(), 65, check_data.begin());
			check_data[65] = k1 ? 'K' : 'R';
			check_data[66] = '1';

			checksum160 check_sig;
			ripemd160(reinterpret_cast<char *>(check_data.data()), 67, &check_sig);

			eosio_assert(memcmp(&check_sig.hash, &vch.end()[-4], 4) == 0, "Signature checksum mismatch");
		}

		signature _sig;
		unsigned int type = k1 ? 0 : 1;
		_sig.data[0] = (uint8_t)type;
		for (int i = 1; i < sizeof(_sig.data); i++)
		{
			_sig.data[i] = vch[i - 1];
		}
		return _sig;
	}

	public_key str_to_pub(const string &pubkey, const bool &checksumming = true)
	{
		string pubkey_prefix("EOS");
		auto base58substr = pubkey.substr(pubkey_prefix.length());
		vector<unsigned char> vch;
		eosio_assert(decode_base58(base58substr, vch), "Decode public key failed");
		eosio_assert(vch.size() == 37, "Invalid public key");
		if (checksumming)
		{

			array<unsigned char, 33> pubkey_data;
			copy_n(vch.begin(), 33, pubkey_data.begin());

			checksum160 check_pubkey;
			ripemd160(reinterpret_cast<char *>(pubkey_data.data()), 33, &check_pubkey);

			eosio_assert(memcmp(&check_pubkey, &vch.end()[-4], 4) == 0, "Public key checksum mismatch");
		}
		public_key _pub_key;
		unsigned int type = 0;
		_pub_key.data[0] = (char)type;
		for (int i = 1; i < sizeof(_pub_key.data); i++)
		{
			_pub_key.data[i] = vch[i - 1];
		}
		return _pub_key;
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
	bool is_key(string account)
	{
		if (account.size() == 53)
			return true;
		return false;
	}
	bool is_eos(asset amount)
	{
		if (amount.symbol == string_to_symbol(4, "EOS"))
		{
			Check_asset(amount, "EOS");
			return true;
		}
		else
			Check_asset(amount, "COF");
		return false;
	}
	void Check_asset(asset amount, string symbol)
	{
		eosio_assert(amount.symbol == string_to_symbol(4, symbol.c_str()),
					 "This symbol not support");
		eosio_assert(amount.is_valid(), "invalid quantity");
		eosio_assert(amount.amount >= 0, "must transfer positive quantity");
	}
	void Check_memo(string memo)
	{
		eosio_assert(memo.size() <= 256, "memo has more than 256 bytes");
	}
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

	void balance_add(public_key account, asset amount, name ram_payer, bool upnonce = false)
	{
		keybalance_table keybalance(_self, _self);
		auto itr_balance = keybalance.find(keytoid(account));
		if (itr_balance == keybalance.end())
		{
			keybalance.emplace(ram_payer, [&](auto &r) {
				r.id = keytoid(account);
				r.user = account;
				r.nonce = 0;
				r.balance.amount = 0;
				r.balance.symbol = string_to_symbol(4, "COF");
				r.eos.amount = 0;
				r.eos.symbol = string_to_symbol(4, "EOS");
				if (amount.symbol == string_to_symbol(4, "EOS"))
					r.eos += amount;
				else
					r.balance += amount;
			});
		}
		else
		{
			keybalance.modify(itr_balance, _self, [&](auto &r) {
				if (amount.symbol == string_to_symbol(4, "EOS"))
					r.eos += amount;
				else
					r.balance += amount;
				if (upnonce)
					r.nonce++;
			});
		}
	}
	void balance_add(name account, asset amount, name ram_payer)
	{
		require_recipient(account);
		namebalance_table namebalance(_self, _self);
		auto itr_balance = namebalance.find(account);
		if (itr_balance == namebalance.end())
		{
			namebalance.emplace(ram_payer, [&](auto &r) {
				r.id = account;
				r.balance.amount = 0;
				r.balance.symbol = string_to_symbol(4, "COF");
				r.eos.amount = 0;
				r.eos.symbol = string_to_symbol(4, "EOS");
				if (amount.symbol == string_to_symbol(4, "EOS"))
					r.eos += amount;
				else
					r.balance += amount;
			});
		}
		else
		{
			namebalance.modify(itr_balance, _self, [&](auto &r) {
				if (amount.symbol == string_to_symbol(4, "EOS"))
					r.eos += amount;
				else
					r.balance += amount;
			});
		}
	}
	void balance_sub(public_key account, asset amount, name ram_payer, bool upnonce = false)
	{
		keybalance_table keybalance(_self, _self);
		auto itr_balance = keybalance.find(keytoid(account));
		eosio_assert(itr_balance != keybalance.end(), "Account doesn't exists");
		keybalance.modify(itr_balance, _self, [&](auto &r) {
			if (amount.symbol == string_to_symbol(4, "EOS"))
				r.eos -= amount;
			else
				r.balance -= amount;
			eosio_assert(r.eos.amount >= 0 && r.balance.amount >= 0, "Overdrawn balance");
			if (upnonce)
				r.nonce++;
		});
	}
	void balance_sub(name account, asset amount, name ram_payer)
	{
		require_recipient(account);
		namebalance_table namebalance(_self, _self);
		auto itr_balance = namebalance.find(account);
		eosio_assert(itr_balance != namebalance.end(), "Account doesn't exists");
		namebalance.modify(itr_balance, _self, [&](auto &r) {
			if (amount.symbol == string_to_symbol(4, "EOS"))
				r.eos -= amount;
			else
				r.balance -= amount;
			eosio_assert(r.eos.amount >= 0 && r.balance.amount >= 0, "Overdrawn balance");
		});
	}
	void verify_sig_transfer(public_key from, name to, asset amount, string memo,
							 asset fee, int64_t nonce, signature sig)
	{
		char strchar[256];
		strncpy(strchar, memo.c_str(), sizeof(strchar));
		strchar[sizeof(strchar) - 1] = 0;

		checksum256 digest;
		char potato[34 + 8 * 2 + 256 + 8 * 2];

		memcpy(potato, &from, sizeof(from));
		memcpy(potato + 34, &to, sizeof(to));
		memcpy(potato + 34 + 8, &amount.amount, sizeof(amount.amount));
		memcpy(potato + 34 + 8 + 8, &strchar, sizeof(strchar));
		memcpy(potato + 34 + 8 + 8 + 256, &fee.amount, sizeof(fee.amount));
		memcpy(potato + 34 + 8 + 8 + 256 + 8, &nonce, sizeof(nonce));

		sha256(potato, sizeof(potato), &digest);

		assert_recover_key(&digest, (const char *)&sig, sizeof(sig), (const char *)&from, sizeof(from));
	}
	void verify_sig_transfer(public_key from, public_key to, asset amount, string memo,
							 asset fee, int64_t nonce, signature sig)
	{

		char strchar[256];
		strncpy(strchar, memo.c_str(), sizeof(strchar));
		strchar[sizeof(strchar) - 1] = 0;

		checksum256 digest;
		char potato[34 * 2 + 8 + 256 + 8 * 2];

		memcpy(potato, &from, sizeof(from));
		memcpy(potato + 34, &to, sizeof(to));
		memcpy(potato + 34 + 34, &amount.amount, sizeof(amount.amount));
		memcpy(potato + 34 + 34 + 8, &strchar, sizeof(strchar));
		memcpy(potato + 34 + 34 + 8 + 256, &fee.amount, sizeof(fee.amount));
		memcpy(potato + 34 + 34 + 8 + 256 + 8, &nonce, sizeof(nonce));

		sha256(potato, sizeof(potato), &digest);

		assert_recover_key(&digest, (const char *)&sig, sizeof(sig), (const char *)&from, sizeof(from));
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
			if (code == N(eosio.token) && action == N(transfer))                                                                 \
			{                                                                                                                    \
				execute_action(&thiscontract, &token::income);                                                                   \
			}                                                                                                                    \
			else if (action == N(onerror))                                                                                       \
			{                                                                                                                    \
				/* onerror is only valid if it is for the "eosio" code account and authorized by "eosio"'s "active permission */ \
				eosio_assert(code == N(eosio), "onerror action's are only valid from the \"eosio\" system account");             \
			}                                                                                                                    \
			else if (action == N(income))                                                                                        \
			{                                                                                                                    \
				eosio_assert(code != self, "DONT DO THAT");                                                                      \
			}                                                                                                                    \
			else if (action != N(income))                                                                                        \
			{                                                                                                                    \
				if (code == self)                                                                                                \
				{                                                                                                                \
					switch (action)                                                                                              \
					{                                                                                                            \
						EOSIO_API(TYPE, MEMBERS)                                                                                 \
					} /* does not allow destructor of thiscontract to run: eosio_exit(0);    */                                  \
				}                                                                                                                \
			}                                                                                                                    \
		}                                                                                                                        \
	}

EOSIO_ABI(token, (setinfo)(mint)(mintn)(transferkk)(transferkn)(transfernn)(transfernk)(income))

// 가시밭길이더라도 자주적 사고를 하는 이의 길을 가십시오. 비판과 논란에 맞서서 당신의 생각을 당당히 밝히십시오. 당신의 마음이 시키는 대로 하십시오. '별난 사람'이라고 낙인찍히는 것보다 순종이라는 오명에 무릎 꿇는 것을 더 두려워하십시오. 당신이 중요하다고 생각하는 이념을 위해서라면 온 힘을 다해 싸우십시오.
// Thomas J. Watson