#!/usr/bin/env python3
"""
Parse Horde Mode spawn tables from Excel and convert to JSON format
"""
import pandas as pd
import json
from datetime import datetime

def parse_spawn_table(excel_path: str, output_path: str):
    """Parse all faction spawn tables from the Excel file"""
    
    # Read all sheets from the Excel file
    excel_file = pd.ExcelFile(excel_path)
    
    spawn_tables = {}
    
    # Skip the MASTER BLANK sheet
    faction_sheets = [sheet for sheet in excel_file.sheet_names if sheet != 'MASTER BLANK']
    
    for faction in faction_sheets:
        print(f"Processing faction: {faction}")
        df = pd.read_excel(excel_path, sheet_name=faction, header=None)
        
        # Initialize faction data structure
        faction_data = {
            "faction": faction,
            "brackets": {
                "2": ["No Spawn"],
                "3-4": [],
                "5-6": [],
                "7-9": [],
                "10+": []
            }
        }
        
        # Based on the structure, the columns are:
        # 0: empty, 1: 3-4 bracket, 2: empty, 3: 5-6 bracket, 4: empty, 5: 7-9 bracket, 6: empty, 7: 10+ bracket, 8: empty, 9: reminders
        # The date values in row 1 indicate the bracket columns
        
        bracket_columns = {
            '3-4': 1,
            '5-6': 3,
            '7-9': 5,
            '10+': 7
        }
        
        # Extract units from each bracket column (starting from row 2, index 2)
        for bracket, col_idx in bracket_columns.items():
            units = []
            for row_idx in range(2, len(df)):  # Start from row 2 (skip headers)
                cell_value = df.iloc[row_idx, col_idx]
                
                if pd.isna(cell_value):
                    continue
                
                # Handle datetime objects (which shouldn't be units)
                if isinstance(cell_value, datetime):
                    continue
                    
                cell_str = str(cell_value).strip()
                
                # Skip empty strings
                if not cell_str or cell_str == '' or cell_str == 'nan':
                    continue
                
                # Skip obvious non-unit rows
                skip_keywords = ['REMINDERS', 'Unmodified', 'Rounds', 'Round 5', 'tier', 
                                'You may instead', 'If there are units', 'The term']
                if any(keyword in cell_str for keyword in skip_keywords):
                    continue
                
                units.append(cell_str)
            
            faction_data["brackets"][bracket] = units
        
        spawn_tables[faction] = faction_data
        total_units = sum(len(units) for bracket, units in faction_data['brackets'].items() if bracket != '2')
        print(f"  - Total units: {total_units}")
        for bracket in ['3-4', '5-6', '7-9', '10+']:
            print(f"    {bracket}: {len(faction_data['brackets'][bracket])} units")
    
    # Write to JSON file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(spawn_tables, f, indent=2, ensure_ascii=False)
    
    print(f"\nSpawn tables saved to {output_path}")
    print(f"Total factions processed: {len(spawn_tables)}")

if __name__ == "__main__":
    excel_path = "/home/ubuntu/upload/40KHordeModeSpawnTablesMasterv1.0.xlsx"
    output_path = "/home/ubuntu/40k_crusade_ai_manager/server/data/spawn_tables.json"
    
    parse_spawn_table(excel_path, output_path)

