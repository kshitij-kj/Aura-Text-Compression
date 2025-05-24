
/**
 * CompressionEngine.ts
 * 
 * This file contains the core logic for text compression and decompression using Huffman coding.
 */

// Node class for building the Huffman tree
class HuffmanNode {
  char: string;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;

  constructor(char: string, freq: number, left: HuffmanNode | null = null, right: HuffmanNode | null = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }

  isLeaf(): boolean {
    return this.left === null && this.right === null;
  }
}

// Priority Queue implementation for Huffman tree construction
class PriorityQueue {
  nodes: HuffmanNode[];
  
  constructor() {
    this.nodes = [];
  }

  enqueue(node: HuffmanNode): void {
    let added = false;
    
    for (let i = 0; i < this.nodes.length; i++) {
      if (node.freq < this.nodes[i].freq) {
        this.nodes.splice(i, 0, node);
        added = true;
        break;
      }
    }
    
    if (!added) {
      this.nodes.push(node);
    }
  }

  dequeue(): HuffmanNode | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.nodes.shift() || null;
  }

  isEmpty(): boolean {
    return this.nodes.length === 0;
  }

  size(): number {
    return this.nodes.length;
  }
}

class CompressionEngine {
  // Build frequency table from input text
  private static buildFrequencyTable(text: string): Map<string, number> {
    const freqTable = new Map<string, number>();
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const count = freqTable.get(char) || 0;
      freqTable.set(char, count + 1);
    }
    
    return freqTable;
  }
  
  // Build Huffman Tree from frequency table
  private static buildHuffmanTree(freqTable: Map<string, number>): HuffmanNode | null {
    const pq = new PriorityQueue();
    
    // Create leaf nodes for each character and add to priority queue
    freqTable.forEach((freq, char) => {
      pq.enqueue(new HuffmanNode(char, freq));
    });
    
    // If text is empty or has only one character
    if (pq.isEmpty()) {
      return null;
    }
    
    if (pq.size() === 1) {
      // Special case for single character
      const onlyNode = pq.dequeue();
      return new HuffmanNode('\0', 0, onlyNode, null);
    }
    
    // Build Huffman Tree: pop two nodes with lowest frequency and create internal node
    while (pq.size() > 1) {
      const left = pq.dequeue();
      const right = pq.dequeue();
      
      if (left && right) {
        const sum = left.freq + right.freq;
        pq.enqueue(new HuffmanNode('\0', sum, left, right));
      }
    }
    
    // Return root of Huffman Tree
    return pq.dequeue();
  }
  
  // Generate codes for each character from Huffman Tree
  private static generateCodes(root: HuffmanNode | null): Map<string, string> {
    const codes = new Map<string, string>();
    
    function generateCodesRecursive(node: HuffmanNode | null, code: string) {
      if (!node) return;
      
      // Found a leaf node with a character
      if (node.isLeaf()) {
        // Don't assign code for empty string (can happen for internal nodes)
        if (node.char !== '\0') {
          codes.set(node.char, code.length > 0 ? code : '0'); // Special case for single character
        }
        return;
      }
      
      // Traverse left (add 0)
      generateCodesRecursive(node.left, code + '0');
      
      // Traverse right (add 1)
      generateCodesRecursive(node.right, code + '1');
    }
    
    generateCodesRecursive(root, '');
    return codes;
  }
  
  // Encode the Huffman tree for storing with compressed data
  private static encodeTree(root: HuffmanNode | null): string {
    if (!root) return '';
    
    let result = '';
    
    function encodeTreeRecursive(node: HuffmanNode | null) {
      if (!node) return;
      
      // Leaf node
      if (node.isLeaf()) {
        result += '1'; // Marker for leaf
        
        // Encode the character (use escape for special chars)
        const charCode = node.char.charCodeAt(0).toString(16).padStart(4, '0');
        result += charCode;
        
        return;
      }
      
      // Internal node
      result += '0'; // Marker for internal node
      
      encodeTreeRecursive(node.left);
      encodeTreeRecursive(node.right);
    }
    
    encodeTreeRecursive(root);
    return result;
  }
  
  // Decode the Huffman tree from encoded data
  private static decodeTree(encodedTree: string): { node: HuffmanNode | null, index: number } {
    let index = 0;
    
    function decodeTreeRecursive(): HuffmanNode | null {
      if (index >= encodedTree.length) return null;
      
      // Leaf node
      if (encodedTree[index] === '1') {
        index++; // Skip the leaf marker
        
        // Decode the character
        if (index + 4 <= encodedTree.length) {
          const charCode = parseInt(encodedTree.substring(index, index + 4), 16);
          index += 4;
          return new HuffmanNode(String.fromCharCode(charCode), 0);
        }
        
        return null;
      }
      
      // Internal node
      index++; // Skip the internal node marker
      
      const left = decodeTreeRecursive();
      const right = decodeTreeRecursive();
      
      return new HuffmanNode('\0', 0, left, right);
    }
    
    const node = decodeTreeRecursive();
    return { node, index };
  }
  
  // Main compress function
  static compress(text: string): string {
    if (!text) return "";
    
    // Build frequency table
    const freqTable = this.buildFrequencyTable(text);
    
    // Build Huffman Tree
    const root = this.buildHuffmanTree(freqTable);
    if (!root) return ""; // Empty text
    
    // Generate codes for each character
    const codes = this.generateCodes(root);
    
    // Encode the tree
    const encodedTree = this.encodeTree(root);
    
    // Encode the text
    let encodedText = '';
    for (let i = 0; i < text.length; i++) {
      const code = codes.get(text[i]);
      if (code) encodedText += code;
    }
    
    // Convert binary string to more efficient representation
    // Each 8 bits will be converted to a character
    let compressedBinary = '';
    let paddingLength = 0;
    
    if (encodedText.length % 8 !== 0) {
      paddingLength = 8 - (encodedText.length % 8);
      encodedText += '0'.repeat(paddingLength);
    }
    
    for (let i = 0; i < encodedText.length; i += 8) {
      const byte = encodedText.substring(i, i + 8);
      const charCode = parseInt(byte, 2);
      compressedBinary += String.fromCharCode(charCode);
    }
    
    // Format: HUFF1:paddingLength:treeLength:encodedTree:compressedData
    return `HUFF1:${paddingLength}:${encodedTree.length}:${encodedTree}:${compressedBinary}`;
  }
  
  // Main decompress function
  static decompress(compressedText: string): string {
    if (!compressedText) return "";
    
    // Check if this is our compressed format
    if (!compressedText.startsWith("HUFF1:")) {
      throw new Error("Invalid compression format");
    }
    
    // Parse the parts
    const parts = compressedText.split(':');
    if (parts.length < 5) {
      throw new Error("Corrupted compression data");
    }
    
    const paddingLength = parseInt(parts[1], 10);
    const treeLength = parseInt(parts[2], 10);
    const encodedTree = parts[3];
    
    // The rest is compressed data (handle case where compressed data might contain ':')
    let compressedBinary = parts.slice(4).join(':');
    
    // Decode the tree
    const { node: root } = this.decodeTree(encodedTree);
    if (!root) {
      throw new Error("Failed to decode Huffman tree");
    }
    
    // Convert compressed data back to binary string
    let encodedText = '';
    for (let i = 0; i < compressedBinary.length; i++) {
      const charCode = compressedBinary.charCodeAt(i);
      const binary = charCode.toString(2).padStart(8, '0');
      encodedText += binary;
    }
    
    // Remove padding if any
    if (paddingLength > 0) {
      encodedText = encodedText.slice(0, -paddingLength);
    }
    
    // Decode the text using Huffman tree
    let result = '';
    let currentNode = root;
    
    for (let i = 0; i < encodedText.length; i++) {
      const bit = encodedText[i];
      
      if (bit === '0') {
        if (currentNode.left) {
          currentNode = currentNode.left;
        }
      } else if (bit === '1') {
        if (currentNode.right) {
          currentNode = currentNode.right;
        }
      }
      
      // Found a leaf node (character)
      if (currentNode.isLeaf()) {
        result += currentNode.char;
        currentNode = root; // Reset to root for next character
      }
    }
    
    return result;
  }
  
  // Additional utility methods
  static getCompressionStats(original: string, compressed: string): { 
    originalSize: number;
    compressedSize: number;
    ratio: number;
    savings: number;
    treeSize?: number;
  } {
    const originalSize = original.length * 2; // UTF-16 (2 bytes per char)
    const compressedSize = compressed.length;
    const ratio = originalSize > 0 ? compressedSize / originalSize : 0;
    const savings = originalSize > 0 ? 100 * (1 - ratio) : 0;
    
    let treeSize = undefined;
    if (compressed.startsWith("HUFF1:")) {
      const parts = compressed.split(':');
      if (parts.length >= 4) {
        treeSize = parseInt(parts[2], 10);
      }
    }
    
    return {
      originalSize,
      compressedSize,
      ratio,
      savings,
      treeSize
    };
  }
}

export default CompressionEngine;
