import pandas as pd
import numpy as np

def calculate_technical_indicators(df: pd.DataFrame) -> dict:
    """
    Calculates technical indicators from a pandas DataFrame containing historical yfinance data.
    Expected columns: Open, High, Low, Close, Volume.
    Returns a dictionary of calculated indicator values (using the latest available row).
    """
    if df is None or len(df) < 50:
        # Return fallback values if history is insufficient
        return {
            "ema_20": 0.0, "ema_50": 0.0, "ema_100": 0.0, "ema_200": 0.0, "sma_20": 0.0,
            "rsi": 50.0, "macd_line": 0.0, "macd_signal": 0.0, "macd_hist": 0.0,
            "adx": 20.0, "atr": 0.0, "cci": 0.0, "roc": 0.0, "mfi": 50.0, "obv": 0, "vwap": 0.0,
            "supertrend": 0.0, "supertrend_dir": "up",
            "pivot": 0.0, "s1": 0.0, "s2": 0.0, "s3": 0.0, "r1": 0.0, "r2": 0.0, "r3": 0.0,
            "bb_upper": 0.0, "bb_middle": 0.0, "bb_lower": 0.0,
            "ichimoku_tenkan": 0.0, "ichimoku_kijun": 0.0, "ichimoku_span_a": 0.0, "ichimoku_span_b": 0.0,
            "psar": 0.0, "donchian_upper": 0.0, "donchian_middle": 0.0, "donchian_lower": 0.0,
            "keltner_upper": 0.0, "keltner_middle": 0.0, "keltner_lower": 0.0,
            "fib_236": 0.0, "fib_382": 0.0, "fib_500": 0.0, "fib_618": 0.0, "fib_786": 0.0
        }

    close = df['Close']
    high = df['High']
    low = df['Low']
    open_p = df['Open']
    volume = df['Volume']

    # 1. EMAs and SMA
    ema_20 = close.ewm(span=20, adjust=False).mean()
    ema_50 = close.ewm(span=50, adjust=False).mean()
    ema_100 = close.ewm(span=100, adjust=False).mean()
    ema_200 = close.ewm(span=200, adjust=False).mean()
    sma_20 = close.rolling(window=20).mean()

    # 2. RSI (14 period)
    delta = close.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / (loss + 1e-9)
    rsi = 100 - (100 / (1 + rs))

    # 3. MACD
    ema_12 = close.ewm(span=12, adjust=False).mean()
    ema_26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema_12 - ema_26
    macd_signal = macd_line.ewm(span=9, adjust=False).mean()
    macd_hist = macd_line - macd_signal

    # 4. ATR (14 period)
    high_low = high - low
    high_close_prev = np.abs(high - close.shift(1))
    low_close_prev = np.abs(low - close.shift(1))
    tr = pd.concat([high_low, high_close_prev, low_close_prev], axis=1).max(axis=1)
    atr = tr.rolling(window=14).mean()

    # 5. ADX (14 period)
    plus_dm = high.diff()
    minus_dm = low.diff()
    plus_dm = np.where((plus_dm > minus_dm) & (plus_dm > 0), plus_dm, 0.0)
    minus_dm = np.where((minus_dm > plus_dm) & (minus_dm > 0), minus_dm, 0.0)
    plus_dm = pd.Series(plus_dm, index=df.index).rolling(window=14).mean()
    minus_dm = pd.Series(minus_dm, index=df.index).rolling(window=14).mean()
    tr_smooth = tr.rolling(window=14).mean()
    plus_di = 100 * (plus_dm / (tr_smooth + 1e-9))
    minus_di = 100 * (minus_dm / (tr_smooth + 1e-9))
    dx = 100 * np.abs(plus_di - minus_di) / (plus_di + minus_di + 1e-9)
    adx = pd.Series(dx).rolling(window=14).mean()

    # 6. CCI (20 period)
    tp = (high + low + close) / 3
    sma_tp = tp.rolling(window=20).mean()
    mad_tp = tp.rolling(window=20).apply(lambda x: np.abs(x - x.mean()).mean(), raw=True)
    cci = (tp - sma_tp) / (0.015 * mad_tp + 1e-9)

    # 7. ROC (12 period)
    roc = ((close - close.shift(12)) / (close.shift(12) + 1e-9)) * 100

    # 8. MFI (14 period)
    typical_price = (high + low + close) / 3
    raw_money_flow = typical_price * volume
    positive_flow = np.where(typical_price > typical_price.shift(1), raw_money_flow, 0.0)
    negative_flow = np.where(typical_price < typical_price.shift(1), raw_money_flow, 0.0)
    pos_flow_roll = pd.Series(positive_flow, index=df.index).rolling(window=14).sum()
    neg_flow_roll = pd.Series(negative_flow, index=df.index).rolling(window=14).sum()
    mfr = pos_flow_roll / (neg_flow_roll + 1e-9)
    mfi = 100 - (100 / (1 + mfr))

    # 9. OBV
    obv = np.where(close > close.shift(1), volume, np.where(close < close.shift(1), -volume, 0.0))
    obv = pd.Series(obv, index=df.index).cumsum()

    # 10. VWAP
    cum_pv = (close * volume).cumsum()
    cum_v = volume.cumsum()
    vwap = cum_pv / (cum_v + 1e-9)

    # 11. SuperTrend (7, 3)
    st_period, st_multiplier = 7, 3.0
    st_atr = atr.bfill()
    hl2 = (high + low) / 2
    basic_upper = hl2 + st_multiplier * st_atr
    basic_lower = hl2 - st_multiplier * st_atr
    upper_band = basic_upper.copy()
    lower_band = basic_lower.copy()
    for i in range(1, len(df)):
        if basic_upper.iloc[i] < upper_band.iloc[i-1] or close.iloc[i-1] > upper_band.iloc[i-1]:
            upper_band.iloc[i] = basic_upper.iloc[i]
        else:
            upper_band.iloc[i] = upper_band.iloc[i-1]
        
        if basic_lower.iloc[i] > lower_band.iloc[i-1] or close.iloc[i-1] < lower_band.iloc[i-1]:
            lower_band.iloc[i] = basic_lower.iloc[i]
        else:
            lower_band.iloc[i] = lower_band.iloc[i-1]
    
    supertrend_vals = pd.Series(0.0, index=df.index)
    supertrend_dir = "up"
    for i in range(1, len(df)):
        if supertrend_vals.iloc[i-1] == upper_band.iloc[i-1]:
            supertrend_vals.iloc[i] = upper_band.iloc[i] if close.iloc[i] <= upper_band.iloc[i] else lower_band.iloc[i]
        else:
            supertrend_vals.iloc[i] = lower_band.iloc[i] if close.iloc[i] >= lower_band.iloc[i] else upper_band.iloc[i]
    if supertrend_vals.iloc[-1] == lower_band.iloc[-1]:
        supertrend_dir = "up"
    else:
        supertrend_dir = "down"

    # 12. Pivot Points (Classic standard) using the last row's high, low, close as previous
    prev_h = high.iloc[-2]
    prev_l = low.iloc[-2]
    prev_c = close.iloc[-2]
    pp = (prev_h + prev_l + prev_c) / 3
    r1 = (2 * pp) - prev_l
    s1 = (2 * pp) - prev_h
    r2 = pp + (prev_h - prev_l)
    s2 = pp - (prev_h - prev_l)
    r3 = prev_h + 2 * (pp - prev_l)
    s3 = prev_l - 2 * (prev_h - pp)

    # 13. Bollinger Bands (20, 2)
    bb_mid = close.rolling(window=20).mean()
    bb_std = close.rolling(window=20).std()
    bb_upper = bb_mid + 2 * bb_std
    bb_lower = bb_mid - 2 * bb_std

    # 14. Ichimoku
    high_9 = high.rolling(window=9).max()
    low_9 = low.rolling(window=9).min()
    tenkan = (high_9 + low_9) / 2
    high_26 = high.rolling(window=26).max()
    low_26 = low.rolling(window=26).min()
    kijun = (high_26 + low_26) / 2
    senkou_a = ((tenkan + kijun) / 2).shift(26)
    high_52 = high.rolling(window=52).max()
    low_52 = low.rolling(window=52).min()
    senkou_b = ((high_52 + low_52) / 2).shift(26)

    # 15. Parabolic SAR (standard implementation)
    psar_vals = close.copy()
    af = 0.02
    ep = low.iloc[0]
    hp = high.iloc[0]
    lp = low.iloc[0]
    is_bull = True
    psar_vals.iloc[0] = low.iloc[0]
    for i in range(1, len(df)):
        prev_sar = psar_vals.iloc[i-1]
        if is_bull:
            psar_vals.iloc[i] = prev_sar + af * (hp - prev_sar)
            if low.iloc[i] < psar_vals.iloc[i]:
                is_bull = False
                psar_vals.iloc[i] = hp
                lp = low.iloc[i]
                af = 0.02
            else:
                if high.iloc[i] > hp:
                    hp = high.iloc[i]
                    af = min(af + 0.02, 0.2)
        else:
            psar_vals.iloc[i] = prev_sar + af * (lp - prev_sar)
            if high.iloc[i] > psar_vals.iloc[i]:
                is_bull = True
                psar_vals.iloc[i] = lp
                hp = high.iloc[i]
                af = 0.02
            else:
                if low.iloc[i] < lp:
                    lp = low.iloc[i]
                    af = min(af + 0.02, 0.2)

    # 16. Donchian Channel
    donchian_up = high.rolling(window=20).max()
    donchian_lo = low.rolling(window=20).min()
    donchian_mid = (donchian_up + donchian_lo) / 2

    # 17. Keltner Channel (20, 2, 10 ATR)
    kc_mid = close.rolling(window=20).mean()
    kc_atr = atr.bfill()
    kc_up = kc_mid + 2 * kc_atr
    kc_lo = kc_mid - 2 * kc_atr

    # 18. Fibonacci Levels (min to max in the current dataframe window)
    highest_p = close.max()
    lowest_p = close.min()
    diff = highest_p - lowest_p
    fib_236 = highest_p - 0.236 * diff
    fib_382 = highest_p - 0.382 * diff
    fib_500 = highest_p - 0.5 * diff
    fib_618 = highest_p - 0.618 * diff
    fib_786 = highest_p - 0.786 * diff

    # Return latest row values
    res = {
        "ema_20": float(ema_20.iloc[-1] or 0),
        "ema_50": float(ema_50.iloc[-1] or 0),
        "ema_100": float(ema_100.iloc[-1] or 0),
        "ema_200": float(ema_200.iloc[-1] or 0),
        "sma_20": float(sma_20.iloc[-1] or 0),
        "rsi": float(rsi.iloc[-1] or 50),
        "macd_line": float(macd_line.iloc[-1] or 0),
        "macd_signal": float(macd_signal.iloc[-1] or 0),
        "macd_hist": float(macd_hist.iloc[-1] or 0),
        "adx": float(adx.iloc[-1] or 20),
        "atr": float(atr.iloc[-1] or 0),
        "cci": float(cci.iloc[-1] or 0),
        "roc": float(roc.iloc[-1] or 0),
        "mfi": float(mfi.iloc[-1] or 50),
        "obv": float(obv.iloc[-1] or 0),
        "vwap": float(vwap.iloc[-1] or 0),
        "supertrend": float(supertrend_vals.iloc[-1] or 0),
        "supertrend_dir": supertrend_dir,
        "pivot": float(pp),
        "s1": float(s1), "s2": float(s2), "s3": float(s3),
        "r1": float(r1), "r2": float(r2), "r3": float(r3),
        "bb_upper": float(bb_upper.iloc[-1] or 0),
        "bb_middle": float(bb_mid.iloc[-1] or 0),
        "bb_lower": float(bb_lower.iloc[-1] or 0),
        "ichimoku_tenkan": float(tenkan.iloc[-1] or 0),
        "ichimoku_kijun": float(kijun.iloc[-1] or 0),
        "ichimoku_span_a": float(senkou_a.iloc[-1] or 0),
        "ichimoku_span_b": float(senkou_b.iloc[-1] or 0),
        "psar": float(psar_vals.iloc[-1] or 0),
        "donchian_upper": float(donchian_up.iloc[-1] or 0),
        "donchian_middle": float(donchian_mid.iloc[-1] or 0),
        "donchian_lower": float(donchian_lo.iloc[-1] or 0),
        "keltner_upper": float(kc_up.iloc[-1] or 0),
        "keltner_middle": float(kc_mid.iloc[-1] or 0),
        "keltner_lower": float(kc_lo.iloc[-1] or 0),
        "fib_236": float(fib_236),
        "fib_382": float(fib_382),
        "fib_500": float(fib_500),
        "fib_618": float(fib_618),
        "fib_786": float(fib_786),
    }
    
    # Clean NaN and infinite values before returning
    for k, v in res.items():
        if isinstance(v, float) and (np.isnan(v) or np.isinf(v)):
            res[k] = 0.0
            
    return res
