import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDataPath,
  loadTextConvTable,
  getReverseTextConvTable,
  encodePokemonText,
  decodePokemonText,
  loadPokemonNames,
  getPokemonName,
  loadExpTable,
  getLevelFromExp,
  clearDataCache,
  type Generation,
} from './dataLoader';

// Mock fetch for testing
global.fetch = vi.fn();

describe('Data Loader', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearDataCache();
    vi.clearAllMocks();
  });

  describe('getDataPath', () => {
    it('should generate correct paths for Gen1', () => {
      expect(getDataPath('Gen1', 'text_conv.txt')).toBe('/useful_data/Gen1/text_conv.txt');
      expect(getDataPath('Gen1', 'pokemon_names.txt')).toBe('/useful_data/Gen1/pokemon_names.txt');
    });

    it('should generate correct paths for Gen2', () => {
      expect(getDataPath('Gen2', 'text_conv.txt')).toBe('/useful_data/Gen2/text_conv.txt');
    });

    it('should generate correct paths for Gen3', () => {
      expect(getDataPath('Gen3', 'pokemon_exp.txt')).toBe('/useful_data/Gen3/pokemon_exp.txt');
    });
  });

  describe('loadTextConvTable', () => {
    it('should load and parse text conversion table', async () => {
      const mockData = 'A 128\nB 129\nC 130\n\' 224\n- 227';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const table = await loadTextConvTable('Gen1');

      expect(table).toEqual({
        A: 128,
        B: 129,
        C: 130,
        '\'': 224,
        '-': 227,
      });
    });

    it('should cache loaded data', async () => {
      const mockData = 'A 128\nB 129';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      // First call
      const table1 = await loadTextConvTable('Gen1');
      // Second call should use cache
      const table2 = await loadTextConvTable('Gen1');

      expect(table1).toBe(table2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw on fetch failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      await expect(loadTextConvTable('Gen1')).rejects.toThrow('Failed to load text_conv.txt');
    });

    it('should handle empty lines', async () => {
      const mockData = 'A 128\n\n\nB 129\n';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const table = await loadTextConvTable('Gen1');

      expect(table).toEqual({
        A: 128,
        B: 129,
      });
    });
  });

  describe('getReverseTextConvTable', () => {
    it('should create reverse mapping', async () => {
      const mockData = 'A 128\nB 129\nC 130';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const reverseTable = await getReverseTextConvTable('Gen1');

      expect(reverseTable).toEqual({
        128: 'A',
        129: 'B',
        130: 'C',
      });
    });

    it('should cache reverse table', async () => {
      const mockData = 'A 128\nB 129';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const table1 = await getReverseTextConvTable('Gen1');
      const table2 = await getReverseTextConvTable('Gen1');

      expect(table1).toBe(table2);
      // Fetch should only be called once (for the forward table)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('encodePokemonText', () => {
    it('should encode text to bytes', async () => {
      const mockData = 'A 128\nB 129\nC 130';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const encoded = await encodePokemonText('ABC', 'Gen1');

      expect(encoded).toEqual([128, 129, 130]);
    });

    it('should use fallback for unknown characters', async () => {
      const mockData = 'A 128\nB 129';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const encoded = await encodePokemonText('AXB', 'Gen1');

      expect(encoded).toEqual([128, 0, 129]); // X maps to 0
    });
  });

  describe('decodePokemonText', () => {
    it('should decode bytes to text', async () => {
      const mockData = 'A 128\nB 129\nC 130';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const decoded = await decodePokemonText([128, 129, 130], 'Gen1');

      expect(decoded).toBe('ABC');
    });

    it('should use fallback for unknown bytes', async () => {
      const mockData = 'A 128\nB 129';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const decoded = await decodePokemonText([128, 255, 129], 'Gen1');

      expect(decoded).toBe('A?B'); // 255 maps to ?
    });
  });

  describe('loadPokemonNames', () => {
    it('should load and parse Pokémon names', async () => {
      const mockData = 'MissingNo.\nRhydon\nKangaskhan\nNidoran♂\nClefairy';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const names = await loadPokemonNames('Gen1');

      expect(names).toEqual(['MissingNo.', 'Rhydon', 'Kangaskhan', 'Nidoran♂', 'Clefairy']);
    });

    it('should cache loaded names', async () => {
      const mockData = 'Bulbasaur\nIvysaur';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const names1 = await loadPokemonNames('Gen1');
      const names2 = await loadPokemonNames('Gen1');

      expect(names1).toBe(names2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw on fetch failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      await expect(loadPokemonNames('Gen1')).rejects.toThrow('Failed to load pokemon_names.txt');
    });

    it('should skip empty lines', async () => {
      const mockData = 'Bulbasaur\n\n\nIvysaur\n';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const names = await loadPokemonNames('Gen1');

      expect(names).toEqual(['Bulbasaur', 'Ivysaur']);
    });
  });

  describe('getPokemonName', () => {
    it('should get Pokémon name by index', async () => {
      const mockData = 'MissingNo.\nRhydon\nKangaskhan';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const name = await getPokemonName(1, 'Gen1');

      expect(name).toBe('Rhydon');
    });

    it('should return fallback for unknown index', async () => {
      const mockData = 'MissingNo.\nRhydon';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const name = await getPokemonName(999, 'Gen1');

      expect(name).toBe('Unknown (999)');
    });

    it('should handle index 0', async () => {
      const mockData = 'MissingNo.\nRhydon';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const name = await getPokemonName(0, 'Gen1');

      expect(name).toBe('MissingNo.');
    });
  });

  describe('loadExpTable', () => {
    it('should load and parse experience table', async () => {
      const mockData = '0 0 1 -54 1 0\n15 6 8 9 10 4\n52 21 27 57 33 13';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const expTable = await loadExpTable('Gen1');

      expect(expTable).toEqual([0, 15, 52]);
    });

    it('should cache loaded table', async () => {
      const mockData = '0 0 1\n15 6 8';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const table1 = await loadExpTable('Gen1');
      const table2 = await loadExpTable('Gen1');

      expect(table1).toBe(table2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw on fetch failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      await expect(loadExpTable('Gen1')).rejects.toThrow('Failed to load pokemon_exp.txt');
    });

    it('should skip empty lines', async () => {
      const mockData = '0 0 1\n\n\n15 6 8\n';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const table = await loadExpTable('Gen1');

      expect(table).toEqual([0, 15]);
    });
  });

  describe('getLevelFromExp', () => {
    it('should get level from experience', async () => {
      const mockData = '0\n15\n52\n122\n237';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const level = await getLevelFromExp(100, 'Gen1');

      expect(level).toBe(3); // exp 100 is between 52 (level 2) and 122 (level 3)
    });

    it('should return 0 for exp below first entry', async () => {
      const mockData = '0\n15\n52';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const level = await getLevelFromExp(0, 'Gen1');

      expect(level).toBe(1); // First level where exp < expTable[1]
    });

    it('should return max level for high exp', async () => {
      const mockData = '0\n15\n52\n122';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      } as Response);

      const level = await getLevelFromExp(999999, 'Gen1');

      expect(level).toBe(4); // Length of table
    });
  });

  describe('clearDataCache', () => {
    it('should clear all cached data', async () => {
      const mockData = 'A 128';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        text: async () => mockData,
      } as Response);

      // Load data to populate cache
      await loadTextConvTable('Gen1');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      clearDataCache();

      // Load again - should fetch again
      await loadTextConvTable('Gen1');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
