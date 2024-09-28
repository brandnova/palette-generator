import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaExpand, FaCompress, FaTimes, FaPlusCircle, FaDownload, FaCopy, FaSave, FaUndo, FaRedo, FaLock, FaUnlock, FaHome, FaStore, FaUser } from 'react-icons/fa';
import { RxReload } from 'react-icons/rx';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';

const ColorPaletteGenerator = () => {
  const [colors, setColors] = useState([
    { hex: `#${Math.floor(Math.random() * 16777215).toString(16)}`, locked: false },
    { hex: `#${Math.floor(Math.random() * 16777215).toString(16)}`, locked: false },
    { hex: `#${Math.floor(Math.random() * 16777215).toString(16)}`, locked: false },
  ]);
  const [savedPalettes, setSavedPalettes] = useState(
    JSON.parse(localStorage.getItem('savedPalettes')) || []
  );
  const [showPaletteHistory, setShowPaletteHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeColorIndex, setActiveColorIndex] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z') {
          undo();
        } else if (event.key === 'y') {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex]);

  const addToHistory = (newColors) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newColors);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setColors(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setColors(history[historyIndex + 1]);
    }
  };

  const generatePalette = () => {
    const newColors = colors.map(color => 
      color.locked ? color : { hex: `#${Math.floor(Math.random() * 16777215).toString(16)}`, locked: false }
    );
    setColors(newColors);
    addToHistory(newColors);
  };

  const addColor = () => {
    if (colors.length < 7) {
      const newColors = [...colors, { hex: `#${Math.floor(Math.random() * 16777215).toString(16)}`, locked: false }];
      setColors(newColors);
      addToHistory(newColors);
    } else {
      toast.error('Maximum of 7 colors allowed in the palette.');
    }
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    toast.success(`Copied ${color} to clipboard!`);
  };

  const savePalette = () => {
    const newPalette = {
      id: Date.now(),
      colors: colors,
    };
    setSavedPalettes([...savedPalettes, newPalette]);
    localStorage.setItem('savedPalettes', JSON.stringify([...savedPalettes, newPalette]));
    toast.success('Palette saved successfully!');
  };

  const loadPalette = (palette) => {
    setColors(palette.colors);
    addToHistory(palette.colors);
  };

  const deletePalette = (paletteId) => {
    const updatedPalettes = savedPalettes.filter((palette) => palette.id !== paletteId);
    setSavedPalettes(updatedPalettes);
    localStorage.setItem('savedPalettes', JSON.stringify(updatedPalettes));
    toast.success('Palette deleted successfully!');
  };

  const removeColor = (index) => {
    const newColors = [...colors];
    newColors.splice(index, 1);
    setColors(newColors);
    addToHistory(newColors);
  };

  const exportPaletteAsImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = colors.length * 100;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    colors.forEach((color, index) => {
      ctx.fillStyle = color.hex;
      ctx.fillRect(index * 100, 0, 100, 200);
    });

    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Color Palette Generator', 10, 230);

    const link = document.createElement('a');
    link.download = 'color-palette.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const toggleLock = (index) => {
    const newColors = [...colors];
    newColors[index].locked = !newColors[index].locked;
    setColors(newColors);
    addToHistory(newColors);
  };

  const handleColorChange = (color) => {
    if (activeColorIndex !== null) {
      const newColors = [...colors];
      newColors[activeColorIndex].hex = color;
      setColors(newColors);
      addToHistory(newColors);
    }
  };

  const generateAccessiblePalette = () => {
    const newColors = [
      { hex: generateRandomColor(), locked: false, role: 'primary' },
      { hex: generateRandomColor(), locked: false, role: 'secondary' },
      { hex: generateRandomColor(), locked: false, role: 'accent' },
    ];
    
    // Ensure good contrast between primary and secondary colors
    while (getContrastRatio(newColors[0].hex, newColors[1].hex) < 4.5) {
      newColors[1].hex = generateRandomColor();
    }

    setColors(newColors);
    addToHistory(newColors);
  };

  const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  };

  const getContrastRatio = (color1, color2) => {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const getLuminance = (color) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-grow flex flex-col md:flex-row">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            className="flex-grow relative"
            style={{ backgroundColor: color.hex }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <button
                  className="bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 font-bold p-2 rounded"
                  onClick={() => copyToClipboard(color.hex)}
                >
                  <FaCopy />
                </button>
                <button
                  className="bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 font-bold p-2 rounded"
                  onClick={() => toggleLock(index)}
                >
                  {color.locked ? <FaLock /> : <FaUnlock />}
                </button>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-2xl shadow-sm">{color.hex}</p>
                <p className="text-white font-semibold mt-2">{color.role} color</p>
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 font-bold p-2 rounded"
                  onClick={() => setActiveColorIndex(index)}
                >
                  Edit
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="bg-white shadow-lg p-4 flex flex-wrap justify-center gap-2">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={generateAccessiblePalette}
        >
          <RxReload className="inline-block mr-2" />
          Generate Accessible Palette
        </button>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
          onClick={() => setShowPaletteHistory(!showPaletteHistory)}
        >
          {showPaletteHistory ? <FaCompress className="inline-block mr-2" /> : <FaExpand className="inline-block mr-2" />}
          {showPaletteHistory ? 'Hide' : 'Show'} Saved
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          onClick={savePalette}
        >
          <FaSave className="inline-block mr-2" />
          Save
        </button>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          onClick={exportPaletteAsImage}
        >
          <FaDownload className="inline-block mr-2" />
          Export
        </button>
        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
          onClick={undo}
          disabled={historyIndex <= 0}
        >
          <FaUndo className="inline-block mr-2" />
          Undo
        </button>
        <button
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
        >
          <FaRedo className="inline-block mr-2" />
          Redo
        </button>
      </div>
      <AnimatePresence>
        {activeColorIndex !== null && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-4 rounded-lg shadow-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <HexColorPicker color={colors[activeColorIndex].hex} onChange={handleColorChange} />
              <button
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full"
                onClick={() => setActiveColorIndex(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPaletteHistory && (
          <motion.div
            className="bg-white shadow-lg p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">Saved Palettes</h2>
            <div className="overflow-x-auto" style={{ maxHeight: '200px' }}>
              <div className="flex space-x-4">
                {savedPalettes.map((palette) => (
                  <motion.div
                    key={palette.id}
                    className="bg-gray-100 rounded-lg p-4 flex flex-col space-y-2 min-w-[200px]"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col h-24">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex-grow"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm"
                        onClick={() => loadPalette(palette)}
                      >
                        Load
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm"
                        onClick={() => deletePalette(palette.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <footer className="bg-gray-800 text-white py-4 px-8 flex justify-between items-center">
        <a href="/" className="text-lg font-bold">VendorHub</a>
        <div className="flex space-x-4">
          <a href="/dashboard" className="hover:text-gray-300">
            <FaHome className="inline-block mr-2" />
            Dashboard
          </a>
          <a href="/store" className="hover:text-gray-300">
            <FaStore className="inline-block mr-2" />
            My Store
          </a>
          <a href="/profile" className="hover:text-gray-300">
            <FaUser className="inline-block mr-2" />
            Profile
          </a>
        </div>
        <p>&copy; 2024 Color Palette Generator</p>
      </footer>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </motion.div>
  );
};

export default ColorPaletteGenerator;