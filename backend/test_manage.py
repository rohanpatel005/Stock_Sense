from apps.market.views import fetch_nse_api
try:
    fii_dii_res = fetch_nse_api('fiidiiTradeReact')
    fii_buy = 'N/A'
    dii_buy = 'N/A'
    net_flow_val = 0.0
    
    fii_sell = 'N/A'
    dii_sell = 'N/A'
    for item in fii_dii_res:
        cat = item.get('category', '')
        if cat == 'DII':
            dii_buy = f"₹{float(item.get('buyValue', 0)):,.2f} Cr"
            dii_sell = f"₹{float(item.get('sellValue', 0)):,.2f} Cr"
            net_flow_val += float(item.get('netValue', 0))
        elif cat == 'FII/FPI':
            fii_buy = f"₹{float(item.get('buyValue', 0)):,.2f} Cr"
            fii_sell = f"₹{float(item.get('sellValue', 0)):,.2f} Cr"
            net_flow_val += float(item.get('netValue', 0))
    
    net_flow = f"{'+' if net_flow_val >= 0 else '-'}₹{abs(net_flow_val):,.2f} Cr"
    fii_dii = {
        'fii_buy': fii_buy,
        'fii_sell': fii_sell,
        'dii_buy': dii_buy,
        'dii_sell': dii_sell,
        'net_flow': net_flow
    }
    print('SUCCESS', fii_dii)
except Exception as e:
    import traceback
    traceback.print_exc()
