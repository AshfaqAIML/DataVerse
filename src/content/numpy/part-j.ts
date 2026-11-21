/**
 * PART J — FILES AND PERFORMANCE: NUMPY IN PRODUCTION
 *
 * The graduation part: binary persistence done right (.npy single arrays,
 * .npz archives, memmap for arrays bigger than RAM) -> text files (savetxt,
 * loadtxt, genfromtxt, with the honest advice about when to hand off to
 * pandas) -> performance (measuring honestly, memory layout, avoiding
 * copies, dtype choices, chunked processing) -> the habits that make NumPy
 * safe in real pipelines.
 *
 * Every `output` field in this file is the REAL output produced by running
 * the code with the same NumPy build the browser playground uses
 * (numpy 2.0.2, Python 3.12) — verified by scripts/verify-numpy-outputs.ts.
 * File-using blocks write and read only /tmp paths so every run is
 * hermetic, and each block creates whatever it later reads. Machine-
 * dependent facts (timings, byte counts) are never printed raw: verified
 * blocks print stable booleans and exact values instead.
 *
 * Authoring conventions:
 *   - code blocks use the AUTOFILL placeholder for their output field; the
 *     verifier fills each one by actually running the code.
 *   - every executed block proves its output; expectError blocks teach errors.
 */
import type { NumpyPart } from "@/lib/numpycourse/types";

export const PART_J: NumpyPart = {
  letter: "J",
  title: "Files and Performance: NumPy in Production",
  tagline: "Saving and loading every format — and making it fast without guessing",
  description:
    "Everything you have built in this course so far lived in memory — and vanished when the program ended. This closing part teaches the persistence layer real pipelines run on: saving single arrays losslessly with .npy, packing many arrays into .npz archives (compressed when size matters), memory-mapping arrays bigger than RAM, and moving data through human-readable CSV text with savetxt, loadtxt and genfromtxt — including the honest lesson that text formats are lossy by choice, and when to hand a messy file to pandas instead. Then comes the graduation skill: making NumPy fast without guessing, by measuring honestly, choosing dtypes deliberately, keeping memory contiguous, avoiding copies, and processing in chunks. Every output shown is machine-verified against the same NumPy build running in your browser playground.",
  lessons: [
    // ------------------------------------------------------------- j-01
    {
      slug: "j-01",
      title: "Binary Files: .npy and .npz",
      minutes: 20,
      summary:
        "Save arrays to disk so they come back bit-for-bit identical: the .npy round trip (one array, its dtype and shape preserved forever), .npz packs of many arrays by keyword, the compression trade, the security rule that keeps untrusted files unpickled, and memory mapping for arrays bigger than RAM.",
      kind: "concept",
      objectives: [
        "Save any array with np.save and load it with np.load, verifying that dtype, shape, strides and values all survive the round trip exactly",
        "Explain what a .npy file contains: a small header describing dtype and shape, followed by the raw data block — and why loading needs no parsing",
        "Pack several arrays into one .npz archive by keyword name with np.savez or np.savez_compressed, and read members back from the lazy NpzFile",
        "Explain why np.load refuses pickled object arrays unless you explicitly allow them, and what that default protects you from",
        "Use memory mapping (np.memmap or mmap_mode) to compute on slices of an on-disk array that is bigger than RAM",
      ],
      why: "Every program in this course so far ended with its arrays gone — memory is a whiteboard, not a filing cabinet. Real pipelines checkpoint intermediate results, share arrays between processes, and ship datasets to other machines; they need a format that round-trips dtype and shape perfectly and loads at disk speed, with no per-value parsing. NumPy's answer is a small family of formats with a strict division of labor: .npy for exactly one array, .npz for a labeled pack of arrays, and memory mapping for arrays that cannot fit in RAM. This lesson makes each one concrete and machine-verified, and it closes with the security rule (never unpickle a file you do not trust) that keeps binary persistence safe in production instead of a liability.",
      blocks: [
        {
          kind: "text",
          text: "You have spent nine parts building, slicing, and reshaping arrays — and every single one of them evaporated the moment the program stopped. Memory is a whiteboard: wonderful to work on, wiped clean at the end. **Files are the filing cabinet.** This lesson is about the two ways NumPy writes arrays to disk — one array per file (.npy) and many arrays per archive (.npz) — plus the memory-mapped trick that lets you compute on arrays **bigger than the RAM you have**.",
        },
        {
          kind: "text",
          text: "The key idea is refreshingly boring: a NumPy array already *is* a block of raw bytes plus a tiny description (dtype, shape, strides — Part A's anatomy). So the natural file format is exactly that: **the description, then the bytes**. No reformatting, no parsing, no rounding. A .npy file is a photograph of the array's memory, not a re-typed copy of its values.",
        },
        {
          kind: "heading",
          text: "The round trip that forgets nothing",
        },
        {
          kind: "text",
          text: "Here is the whole contract in one experiment: build a small sensor grid with a deliberately unusual dtype (`int16`, 2 bytes per reading), save it, load it back, and check that *nothing* changed. In production code, these checks — dtype, shape, values — are the first lines you write after any load:",
        },
        {
          kind: "code",
          title: "np.save / np.load: dtype, shape, strides, values — all preserved",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)   # a scratch folder for this lesson

# 3 stations x 4 readings, stored compactly as int16 on purpose
sensors = (np.arange(12) * 10).astype(np.int16).reshape(3, 4)
np.save("/tmp/numpy-course/sensors.npy", sensors)

restored = np.load("/tmp/numpy-course/sensors.npy")
print("dtype :", restored.dtype, " shape:", restored.shape)
print("values identical  :", np.array_equal(restored, sensors))
print("strides identical :", restored.strides == sensors.strides)
print(restored)
`,
          output: `dtype : int16  shape: (3, 4)
values identical  : True
strides identical : True
[[  0  10  20  30]
 [ 40  50  60  70]
 [ 80  90 100 110]]`,
          outputNote:
            "The array comes back as the same machine: int16 (not silently widened to int64), shape (3, 4) (not flattened), and every value bit-for-bit identical. Binary formats do not translate; they copy.",
          explain: [
            "`np.save(path, arr)` writes ONE array; `np.load(path)` reads it back. That is the entire API for the common case.",
            "The dtype survived exactly — a `int16` array does not become `int64`, and a `float32` will not become `float64`. Whatever you saved is what loads.",
            "`np.array_equal` (Part B) checks the values. Comparing strides as well proves the *layout* came back in the same row-major walking order (Part A, Lesson a-04).",
            "Note the file gets a `.npy` suffix appended automatically if you forget it.",
          ],
        },
        {
          kind: "arrayViz",
          title: "What the file stores: one flat block plus a shape",
          mode: "reshape",
          name: "sensors",
          caption:
            "The 12 saved values, re-grouped four ways. A .npy file stores exactly what the (12,) strip shows: the values in row-major order, one after another — plus the shape (3, 4) written into its small header. Click (4, 3) or (2, 6) and watch the flat order never change: shape is metadata, not data. That is why loading rebuilds any view of the same values instantly.",
          data: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110],
          targets: [[12], [3, 4], [4, 3], [2, 6]],
        },
        {
          kind: "heading",
          text: "What is actually inside the file?",
        },
        {
          kind: "text",
          text: "A .npy file is a tiny header followed by the payload. The header is a fixed magic prefix (so loaders can recognize the format) plus one line of text describing the array — its dtype code, its shape, and whether the bytes are in row-major or column-major order. Then the payload begins: the raw block, nothing else. You never need to read these bytes yourself, but knowing the layout removes all the magic:",
        },
        {
          kind: "code",
          title: "The anatomy of sensors.npy, paraphrased (illustrative)",
          lang: "text",
          code: `The first ~100 bytes of sensors.npy, translated into English:

  magic   : "this is a .npy file, version 1.0"     (6 magic bytes)
  header  : {'descr': '<i2',                       <- dtype: int16, little-endian
             'fortran_order': False,               <- row-major (C order)
             'shape': (3, 4)}                      <- the grid to rebuild
  payload : 24 raw bytes = 12 values x 2 bytes, in exactly the
            row-major order the reshape lab above shows

A loader reads the one-line description, allocates a block of the
right dtype and shape, and streams the payload straight in.
Nothing is parsed. Nothing is rounded. Nothing is guessed.
`,
          outputNote:
            "Illustration, not program output — the real header is padded with spaces to a fixed length so the payload starts at a predictable offset. The np.lib.format module can read and write these headers directly if you ever need to.",
          explain: [
            "`descr` is the dtype in a compact code: `<i2` means little-endian signed 2-byte integer — the int16 we chose.",
            "`fortran_order: False` records that the payload is in row-major (C) order — the same order the reshape lab walks.",
            "Contrast this with a CSV of the same data: every character of every number would have to be *parsed* on load. Binary is why .npy loads are dramatically faster and always exact.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.save",
          purpose: "Write exactly one array to disk in NumPy's .npy binary format, preserving dtype, shape and values exactly.",
          signature: "np.save(file, arr, allow_pickle=True, fix_imports=True)",
          purposeDetail:
            "np.save is the one-array-per-file half of NumPy's persistence story. It writes the small .npy header (dtype, shape, memory order) followed by the array's raw bytes, so np.load can rebuild the identical array later with zero parsing and zero precision loss. It is the right default whenever you control both the saving and the loading side: checkpoints, caches, arrays handed between your own scripts or processes. When you need several arrays in one file, use np.savez or np.savez_compressed instead; when the file must be human-readable or consumed by other tools, use np.savetxt.",
          params: [
            {
              name: "file",
              type: "str, Path, or file object",
              required: true,
              description: "Where to write. A filename gets `.npy` appended if it does not already end with it; a path with directories must exist (NumPy will not create folders for you).",
              example: '"/tmp/sensors.npy"',
            },
            {
              name: "arr",
              type: "array_like",
              required: true,
              description: "The array to save. Converted with np.asanyarray first, so lists save fine (with an inferred dtype).",
              example: "sensors",
            },
            {
              name: "allow_pickle",
              type: "bool",
              description: "Required to save OBJECT arrays (arrays of arbitrary Python things), because their contents are serialized with pickle. Defaults to True on save — but the security default that matters is on the LOAD side, where it is False.",
              example: "allow_pickle=True",
            },
          ],
          returns: {
            type: "None",
            description: "Writes the file as a side effect; nothing is returned.",
          },
          example: `import numpy as np

calibration = np.linspace(0.0, 9.0, 10).astype(np.float32)
np.save("/tmp/calib.npy", calibration)          # one array, one file

back = np.load("/tmp/calib.npy")                # dtype and shape come back intact
print(back.dtype, back.shape)
print("round trip exact:", np.array_equal(back, calibration))

# forget the suffix and NumPy adds it for you
np.save("/tmp/calib2", calibration)
print("extension added:", np.array_equal(np.load("/tmp/calib2.npy"), calibration))
`,
          exampleOutput: `float32 (10,)
round trip exact: True
extension added: True`,
          commonMistakes: [
            {
              mistake: "Saving to a directory that does not exist.",
              why: "np.save writes a file; it never creates folders. A path like /tmp/new/dir/x.npy fails with FileNotFoundError if new/dir is missing.",
              fix: "Create the folder first (os.makedirs(folder, exist_ok=True)) — exactly what this lesson's verified blocks do.",
            },
            {
              mistake: "Calling np.save repeatedly to add more arrays to the same file.",
              why: "Each call overwrites the file with ONE array. A .npy holds exactly one array by design.",
              fix: "Want several arrays in one file? That is np.savez / np.savez_compressed, the next topic.",
            },
            {
              mistake: "Expecting a .npy file to be readable in a text editor or Excel.",
              why: "The payload is raw binary bytes; opening it as text shows gibberish and saving it from an editor corrupts it.",
              fix: "Use np.savetxt when the file must be human-readable or consumed by non-NumPy tools (Lesson j-02).",
            },
          ],
          related: [
            { name: "np.load", relation: "The way back: reads the header and streams the payload into an identical array." },
            { name: "np.savez / np.savez_compressed", relation: "The many-arrays-per-file variants, using keyword names as archive keys." },
            { name: "np.savetxt", relation: "Text (CSV) export — readable everywhere, but lossy by choice and slower to load." },
            { name: "np.lib.format.open_memmap", relation: "Creates a .npy directly on disk and hands you a memory map of it, without ever holding the full array in RAM." },
          ],
          applications: [
            "Checkpoints: saving the state of a long pipeline so a later stage can resume without recomputing",
            "Caches: storing an expensive transformation (a big FFT, a normalized dataset) once and reloading it at disk speed",
            "Handoffs between your own processes, workers, or notebooks — exact bytes, no serialization surprises",
          ],
          notes:
            "np.save writes plain bytes; it does not compress. For arrays with repeated or smooth values, np.savez_compressed can shrink archives dramatically at the cost of some CPU on save and load.",
        },
        {
          kind: "functionDoc",
          name: "np.load",
          purpose: "Read an array (or an archive of arrays) from a .npy or .npz file back into memory — or memory-map it instead.",
          signature: 'np.load(file, mmap_mode=None, allow_pickle=False, fix_imports=True, encoding="ASCII", *, max_header_size=10000)',
          purposeDetail:
            "np.load is the single entry point for everything np.save and np.savez write. Given a .npy path it returns one ndarray, rebuilt exactly: same dtype, same shape, same values. Given a .npz path it returns an NpzFile — a lazy, key-to-array mapping you index like a dictionary. Two production-critical behaviors: it refuses to unpickle object arrays unless you explicitly pass allow_pickle=True (the security default), and with mmap_mode it can hand you a memory-mapped view of the file instead of reading it into RAM — the gateway to arrays larger than memory.",
          params: [
            {
              name: "file",
              type: "str, Path, or file object",
              required: true,
              description: "The .npy file (one array comes back) or .npz file (an NpzFile mapping comes back).",
              example: '"/tmp/sensors.npy"',
            },
            {
              name: "mmap_mode",
              type: 'None or "r", "r+", "c"',
              description: "When given, the array is memory-mapped instead of read: the file stays on disk and pages are pulled in as you touch them. \"r\" maps read-only; \"r+\" allows writing through the map; \"c\" copy-on-write.",
              example: 'mmap_mode="r"',
            },
            {
              name: "allow_pickle",
              type: "bool",
              description: "Must be True to load object arrays (arrays of arbitrary Python objects). Defaults to False, which refuses them — a security guard, because a pickle can execute arbitrary code when deserialized.",
              example: "allow_pickle=False",
            },
            {
              name: "max_header_size",
              type: "int",
              description: "Refuses headers larger than this many bytes (default 10,000) — a guard against corrupted or hostile files claiming absurd shapes.",
              example: "max_header_size=10000",
            },
          ],
          returns: {
            type: "ndarray, NpzFile, or memmap",
            description: "An ndarray for .npy input; an NpzFile (dict-like, lazy) for .npz input; a memmap when mmap_mode is set.",
          },
          example: `import numpy as np

data = np.arange(6, dtype=np.int16).reshape(2, 3)
np.save("/tmp/mini.npy", data)

restored = np.load("/tmp/mini.npy")
print(restored.dtype, restored.shape, restored.tolist())

# a .npz archive loads as a lazy key -> array mapping
np.savez("/tmp/mini.npz", a=data, b=data * 10)
archive = np.load("/tmp/mini.npz")
print(type(archive).__name__, sorted(archive.files))
print("b is:", archive["b"].tolist())

# memory-map instead of reading into RAM
mapped = np.load("/tmp/mini.npy", mmap_mode="r")
print("mapped type:", type(mapped).__name__)
`,
          exampleOutput: `int16 (2, 3) [[0, 1, 2], [3, 4, 5]]
NpzFile ['a', 'b']
b is: [[0, 10, 20], [30, 40, 50]]
mapped type: memmap`,
          commonMistakes: [
            {
              mistake: "Loading a .npz and expecting an ndarray.",
              why: "An archive holds many arrays, so np.load returns an NpzFile object. Index it by the keyword name you saved under.",
              fix: "pack = np.load('week.npz'); temps = pack['temps'] — then temps is the ndarray you wanted.",
            },
            {
              mistake: "Calling np.load on a file that was never written (typo in the path, wrong folder).",
              why: "You get FileNotFoundError with the exact path in the message — read it; it is nearly always a name or directory mistake.",
              fix: "Print the path before loading, and build paths from variables instead of retyping strings.",
            },
            {
              mistake: "Flipping allow_pickle=True out of habit to make an error go away.",
              why: "A pickled .npy from someone else can execute arbitrary code the moment it is deserialized. The default False is a seatbelt.",
              fix: "Opt in only for files YOU created. For sharing plain numbers, never store object arrays at all.",
            },
          ],
          related: [
            { name: "np.save", relation: "The matching writer for single arrays." },
            { name: "np.savez / np.savez_compressed", relation: "The writers that produce the .npz archives np.load also reads." },
            { name: "np.memmap", relation: "The lower-level memory-mapping constructor, for raw files without a .npy header." },
            { name: "np.loadtxt", relation: "Reads text files instead — parsing instead of streaming, lossy by choice (Lesson j-02)." },
          ],
          applications: [
            "Reloading checkpoints and caches written by earlier stages of a pipeline",
            "Sharing arrays across processes: one writer, many np.load readers",
            "mmap_mode='r' on a huge .npy to compute on slices without ever fitting it in RAM",
          ],
          notes:
            "Since NumPy 1.16.3 the allow_pickle default is False — the single most important security default in the file API. Object arrays saved with pickle should be rare; if you find yourself needing them for metadata, consider a separate JSON sidecar instead.",
        },
        {
          kind: "heading",
          text: "One array per file — and packs with np.savez",
        },
        {
          kind: "text",
          text: "A .npy file holds **exactly one array**. That simplicity is a feature (there is nothing to get wrong), but real datasets are rarely one array: you have measurements, their labels, a calibration vector, a version number. `np.savez` packs any number of arrays into **one .npz archive**, using the keyword names you pass as the keys — like a dict dumped to disk:",
        },
        {
          kind: "code",
          title: "np.savez: a labeled pack of arrays",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

temps = np.linspace(15.0, 24.0, 10)      # ten temperature readings
labels = np.array(["mon", "tue", "wed", "thu", "fri", "sat", "sun", "mon", "tue", "wed"])

np.savez("/tmp/numpy-course/week.npz", temps=temps, labels=labels)

pack = np.load("/tmp/numpy-course/week.npz")
print("type :", type(pack).__name__)
print("keys :", sorted(pack.files))
print("temps:", pack["temps"].dtype, pack["temps"].shape)
print("labels round trip:", np.array_equal(pack["labels"], labels))
print("temps round trip :", np.array_equal(pack["temps"], temps))
`,
          output: `type : NpzFile
keys : ['labels', 'temps']
temps: float64 (10,)
labels round trip: True
temps round trip : True`,
          outputNote:
            "The keyword names (temps, labels) became the archive keys. Strings round-trip too — the labels come back as the same <U3 unicode array.",
          explain: [
            "`np.savez(path, key1=a1, key2=a2, ...)` — every keyword becomes a filename inside the archive. Loading gives an NpzFile, and `pack['temps']` materializes that one member as an ndarray.",
            "`pack.files` lists the keys — sorted here so the printed line is stable. Strings survive as NumPy unicode dtype (`<U3`: up to 3 characters, Part B's dtype codes).",
            "Loading is **lazy**: np.load opens the archive and reads its table of contents, but each member's bytes are only decompressed and read when you actually access that key. For an archive of ten arrays where you use two, you pay for two.",
          ],
        },
        {
          kind: "heading",
          text: "The space trade: np.savez_compressed",
        },
        {
          kind: "text",
          text: "Plain `np.savez` stores the bytes exactly as they are — fast, but large. `np.savez_compressed` runs the same members through zip compression first: a slower write and a slower read, but a much smaller file **when the data has structure** — smooth images, mostly-constant grids, sorted counters. Byte counts differ per machine and per zip build, so the verified version prints only the stable fact (the comparison), never the raw sizes:",
        },
        {
          kind: "code",
          title: "Compressed vs plain, measured honestly (booleans, not bytes)",
          code: `import numpy as np
import os
import os.path

os.makedirs("/tmp/numpy-course", exist_ok=True)

# A smooth grid: mostly ones with a sparse pattern of highlights
photo = np.ones((200, 200))
photo[::7, ::5] = 2.5

np.savez("/tmp/numpy-course/plain.npz", photo=photo)
np.savez_compressed("/tmp/numpy-course/zipped.npz", photo=photo)

plain_bytes = os.path.getsize("/tmp/numpy-course/plain.npz")
zipped_bytes = os.path.getsize("/tmp/numpy-course/zipped.npz")

print("compressed is smaller:", zipped_bytes < plain_bytes)
back = np.load("/tmp/numpy-course/zipped.npz")["photo"]
print("values survive exactly:", np.array_equal(back, photo))
`,
          output: `compressed is smaller: True
values survive exactly: True`,
          outputNote:
            "The byte counts were computed and compared but deliberately not printed — exact sizes vary with the zip implementation. The stable facts: the compressed archive is smaller, and the values still round-trip exactly.",
          explain: [
            "The data is 320,000 bytes of mostly-identical doubles — ideal compression food. The plain archive stores them raw; the compressed one stores a small encoding.",
            "For random noise, compression gains almost nothing (random bytes do not compress); for smooth, sparse, or repeated data it can shrink files enormously. Measure on YOUR data before committing either way.",
            "Decompression is lossless — `np.array_equal` proves the values came back identical. This is a space-for-CPU trade, never a precision trade (that is Lesson j-02's story about text).",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.savez_compressed",
          purpose: "Pack any number of named arrays into one compressed .npz archive — the space-efficient sibling of np.savez.",
          signature: "np.savez_compressed(file, *args, **kwds)",
          purposeDetail:
            "np.savez_compressed is np.savez with zip compression on: every keyword becomes a key inside a single .npz archive, and each member is compressed before writing. Use it when arrays are large relative to disk space, when they contain smooth or repetitive values (which compress extremely well), or when the archive travels over a network. Reach for plain np.savez when members are noise-like (compression would barely help) or when every millisecond of load time matters more than the bytes.",
          params: [
            {
              name: "file",
              type: "str, Path, or file object",
              required: true,
              description: "Target path; `.npz` is appended if missing. Parent directories must already exist.",
              example: '"/tmp/dataset-pack.npz"',
            },
            {
              name: "*args",
              type: "ndarray...",
              description: "Positional arrays are stored under automatic names arr_0, arr_1, ... — workable, but keyword names are self-documenting and preferred.",
              example: "a, b",
            },
            {
              name: "**kwds",
              type: "name=ndarray",
              description: "Each keyword becomes the archive key for that array: measurements=m, labels=l, version=v.",
              example: "measurements=m, labels=l",
            },
          ],
          returns: {
            type: "None",
            description: "Writes the archive as a side effect; nothing is returned.",
          },
          example: `import numpy as np
import os.path

photo = np.ones((100, 100))       # a smooth grid: repeated values compress well
photo[::5, ::5] = 4.0

np.savez("/tmp/plain.npz", photo=photo)
np.savez_compressed("/tmp/zipped.npz", photo=photo)

print("compressed is smaller:",
      os.path.getsize("/tmp/zipped.npz") < os.path.getsize("/tmp/plain.npz"))
print("values survive exactly:",
      np.array_equal(np.load("/tmp/zipped.npz")["photo"], photo))
`,
          exampleOutput: `compressed is smaller: True
values survive exactly: True`,
          commonMistakes: [
            {
              mistake: "Expecting compression to help random or already-packed data.",
              why: "Zip compression exploits repeated patterns. Pure noise (hashed ids, encrypted bytes, random floats) compresses to nearly its original size — you pay the CPU and gain nothing.",
              fix: "Measure on a real sample of your data: save both ways once, compare sizes, then decide.",
            },
            {
              mistake: "Assuming compressed means lossy (like JPEG).",
              why: "This is zip, not a lossy codec. Every byte of every value survives; np.array_equal confirms it.",
              fix: "Think 'zipped folder', not 'compressed image'. Precision is untouched.",
            },
            {
              mistake: "Using positional args and then wondering what pack.files means.",
              why: "Positional arrays get names arr_0, arr_1, ... — keys that say nothing about the data.",
              fix: "Always pass keyword names: np.savez_compressed(path, temps=temps, labels=labels).",
            },
          ],
          related: [
            { name: "np.savez", relation: "Same archive format without compression — faster, larger; right for noise-like data." },
            { name: "np.load", relation: "Reads the archive back as a lazy NpzFile, decompressing each member on access." },
            { name: "np.save", relation: "The single-array alternative when there is nothing to pack." },
          ],
          applications: [
            "Dataset packs: measurements + labels + metadata + a version array in one shippable file",
            "Archives of model coefficients or filter banks that move over a network",
            "Space budgets: many large, structured arrays on a small disk",
          ],
          notes:
            "Members are compressed individually, and loading stays lazy: np.load reads the archive's table of contents, and only the members you access get decompressed.",
        },
        {
          kind: "heading",
          text: "Security: untrusted files stay unpickled",
        },
        {
          kind: "text",
          text: "One more thing before the big-arrays section, because it matters in production: NumPy arrays can technically hold **arbitrary Python objects** (object arrays), and saving those requires `pickle` — Python's serialization format, which can *execute code* while loading. A malicious .npy or .npz with pickled content could run anything the moment you load it. That is why, since NumPy 1.16.3, **`np.load` refuses to unpickle by default**. Watch the refusal happen:",
        },
        {
          kind: "code",
          title: "The default that protects you",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

# An OBJECT array: its elements are arbitrary Python objects (dicts here),
# so saving it uses pickle -- allowed when WE choose it:
records = np.array([{"id": 1}, {"id": 2}])
np.save("/tmp/numpy-course/records.npy", records, allow_pickle=True)

# Loading it back WITHOUT opting in is refused:
loaded = np.load("/tmp/numpy-course/records.npy")
`,
          expectError: "ValueError: Object arrays cannot be loaded when allow_pickle=False",
          outputNote:
            "The save succeeded because we explicitly allowed it. The load failed because np.load's default is allow_pickle=False — the seatbelt stays on unless you release it on purpose. Untrusted files stay unpickled.",
          explain: [
            "Object arrays (dtype object) cannot be stored as plain bytes, so np.save pickles their contents — and pickle data can trigger arbitrary code execution while being read.",
            "The ValueError is the guard working as designed. To load a pickled array you created and trust, pass allow_pickle=True explicitly; that line in a code review is a visible, deliberate decision.",
            "The professional habit: share plain numeric arrays, never object arrays. If you must attach metadata, put it in a separate text file (JSON) next to the .npz.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Treat every downloaded .npy/.npz as untrusted",
          text: "The allow_pickle default is your seatbelt: plain numeric arrays load fine, but anything pickled is refused unless you explicitly opt in. Never flip that flag for a file from the internet, a shared drive, or an email — a crafted pickle can execute code on load. Plain numbers (int, float, bool, unicode strings) never need pickle; if a colleague sends you an object-array file, ask them to send the data as ordinary typed arrays instead.",
        },
        {
          kind: "heading",
          text: "Bigger than RAM: memory-mapped arrays",
        },
        {
          kind: "text",
          text: "Now the trick that breaks the RAM ceiling. **Memory mapping** asks the operating system to make a file *look like* memory: you get an object that behaves exactly like an ndarray, but its bytes stay on disk until you touch them. Reading `mm[490:500]` pulls in only the pages covering those rows — an 80 GB file works fine on a laptop with 8 GB of RAM, as long as you compute on slices. NumPy offers two doors into this: `np.load(..., mmap_mode=...)` for .npy files (the header supplies dtype and shape), and the lower-level `np.memmap` for raw binary files where you supply them yourself.",
        },
        {
          kind: "functionDoc",
          name: "np.memmap",
          purpose: "Create an ndarray-like view directly on top of a disk file, so data is paged in from disk as you touch it instead of being loaded up front.",
          signature: 'np.memmap(filename, dtype=<class "numpy.uint8">, mode="r+", offset=0, shape=None, order="C")',
          purposeDetail:
            "np.memmap is the raw form of memory mapping: you give it a filename, a dtype, and a shape, and it hands back an array whose data lives in the file. Nothing is read at creation time; the OS fetches (and caches) pages of the file on demand as your code indexes them. This is how you compute on datasets bigger than RAM — one window at a time. For .npy files (which carry their own header), np.load(path, mmap_mode='r') is usually more convenient, because dtype and shape are read from the file instead of typed by hand. Remember to flush() a writable map before dropping it, or the last pages may not reach disk.",
          params: [
            {
              name: "filename",
              type: "str or Path",
              required: true,
              description: "The file to map. For mode 'w+' the file is created (or truncated); for reading modes it must already exist.",
              example: '"/tmp/diskgrid.dat"',
            },
            {
              name: "dtype",
              type: "dtype",
              description: "How to interpret the raw bytes (default uint8). For a raw file you must know this yourself — nothing in the file records it.",
              example: "np.float64",
            },
            {
              name: "mode",
              type: 'str',
              description: '"r" read-only, "r+" read/write existing file, "w+" create-or-truncate read/write, "c" copy-on-write (writes stay in memory until flush).',
              example: 'mode="w+"',
            },
            {
              name: "offset",
              type: "int",
              description: "Skip this many bytes at the start of the file — for example to map the payload after a custom header. Default 0.",
              example: "offset=0",
            },
            {
              name: "shape",
              type: "tuple of int",
              description: "The grid to expose. With mode 'w+' this defines the file's size; for existing files you must state it correctly for your dtype and offset.",
              example: "shape=(200, 300)",
            },
          ],
          returns: {
            type: "memmap (ndarray subclass)",
            description: "An array whose buffer is the file itself. Slices of it are memmaps too; whole-array operations pull in everything, so slice deliberately.",
          },
          example: `import numpy as np

# Create a 200 x 300 float64 array directly on disk ("w+" = create + write)
disk = np.memmap("/tmp/diskgrid.dat", dtype=np.float64, mode="w+", shape=(200, 300))
disk[:] = np.linspace(0.0, 1.0, 300) * 10.0
disk.flush()        # push the changes to the file
del disk            # release the mapping

# Reopen read-only: nothing is read from disk yet
mm = np.memmap("/tmp/diskgrid.dat", dtype=np.float64, mode="r", shape=(200, 300))
print("row 5, first 4 values:", mm[5, :4])
print("total shape:", mm.shape, "dtype:", mm.dtype)
`,
          exampleOutput: `row 5, first 4 values: [0.         0.03344482 0.06688963 0.10033445]
total shape: (200, 300) dtype: float64`,
          commonMistakes: [
            {
              mistake: "Forgetting flush() (or del) on a writable map and reading the file elsewhere.",
              why: "Writes go to the OS page cache; until they are flushed, another process (or a crash) may not see them.",
              fix: "Call mm.flush() when a writing stage finishes, and let the mapping go out of scope before another reader opens the file.",
            },
            {
              mistake: "Mapping a raw file with the wrong dtype or shape.",
              why: "A raw .dat carries no header, so np.memmap trusts whatever you claim. Wrong numbers silently reinterpret the bytes as garbage.",
              fix: "Write dtype and shape into your own tiny header (or use a .npy via np.load(..., mmap_mode='r') where the header does it for you).",
            },
            {
              mistake: "Calling whole-array operations on a huge map and expecting the RAM win.",
              why: "mm.sum() or mm[:] touches EVERY page — the whole file flows through RAM after all, and can thrash or die on a machine that cannot hold it.",
              fix: "Compute in slices or chunks (Lesson j-03's lever 6): per-window reductions, accumulated in a small running result.",
            },
          ],
          related: [
            { name: "np.load(mmap_mode=...)", relation: "The convenient form for .npy files — dtype and shape come from the header instead of your memory." },
            { name: "np.lib.format.open_memmap", relation: "Creates a NEW .npy on disk and returns it as a writable memmap — ideal for writing huge outputs without a huge buffer." },
            { name: "np.save / np.load", relation: "The plain in-RAM round trip for arrays that do fit in memory." },
          ],
          applications: [
            "Out-of-core processing: computing on slices of an 80 GB array with 8 GB of RAM",
            "Shared read-only datasets: many processes map the same file; the OS caches the pages once",
            "Writing huge results incrementally without ever materializing the full array in memory",
          ],
          notes:
            "Memory maps do not make single operations faster — they change WHERE the bytes live. The performance win comes from touching only the windows you need; the pattern for that is chunked processing, taught in Lesson j-03.",
        },
        {
          kind: "code",
          title: "An 8 MB array on disk, ten rows at a time",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

# Create a (1000, 1000) float64 array directly on disk: 8 MB of payload,
# without ever holding 8 MB of source data in RAM
big = np.lib.format.open_memmap("/tmp/numpy-course/big.npy", dtype=np.float64,
                                mode="w+", shape=(1000, 1000))
big[:] = np.arange(1000)[:, None] * 0.5 + np.arange(1000) * 0.001
big.flush()          # make sure the bytes reach the file
del big              # release the write mapping

# Reopen read-only: NOTHING has been read into RAM yet
mm = np.load("/tmp/numpy-course/big.npy", mmap_mode="r")
print("type:", type(mm).__name__, " shape:", mm.shape, " dtype:", mm.dtype)

window = mm[490:500]                       # ask for ten rows only
print("slice is still memory-mapped:", isinstance(window, np.memmap))
print("row sums for rows 490-499 (rounded):")
print(np.round(window.sum(axis=1), 3))
`,
          output: `type: memmap  shape: (1000, 1000)  dtype: float64
slice is still memory-mapped: True
row sums for rows 490-499 (rounded):
[245499.5 245999.5 246499.5 246999.5 247499.5 247999.5 248499.5 248999.5
 249499.5 249999.5]`,
          outputNote:
            "The ten-row window touched roughly 80 KB of file pages; the other 7.9 MB never entered memory. The same three lines work unchanged on an 80 GB file.",
          explain: [
            "`np.lib.format.open_memmap` creates a real .npy on disk and hands you a writable memory map of it — the header is written for you, so `np.load(..., mmap_mode='r')` can reopen it later without being told the dtype or shape.",
            "The fill line broadcasts a (1000, 1) column and a (1000,) row into the full grid (Part G) — one vectorized write flows straight through the page cache to disk.",
            "`mm[490:500]` returns a memmap *view* of just those rows: NumPy asked the OS for the pages behind them and nothing else. The row sums are computed over a window that fits in a few KB.",
            "This array never fully lives in RAM at any point in the program — not when writing it, not when reading the window. That is the whole trick.",
          ],
        },
        {
          kind: "text",
          text: "When is each tool the right one? The decision is short enough to fit in a table — and it comes with a preview: text formats (Lesson j-02) earn their row too:",
        },
        {
          kind: "table",
          title: "Which container, which job",
          headers: ["Tool", "File", "Reach for it when"],
          rows: [
            ["np.save / np.load", ".npy", "One array, exact round trip, fastest load — the default for checkpoints and caches"],
            ["np.savez / np.load", ".npz", "Several named arrays in one file: measurements + labels + metadata as a pack"],
            ["np.savez_compressed", ".npz", "Same pack, but the data is smooth or repetitive and disk space or transfer size matters"],
            ["np.load(mmap_mode=...) / np.memmap", ".npy / raw", "The array is bigger than RAM (or shared by several processes); you compute on slices"],
            ["np.savetxt / np.loadtxt / genfromtxt", ".csv / .txt", "Humans or other tools must read the file; lossiness is acceptable (Lesson j-02)"],
          ],
          caption:
            "Binary for machines, text for humans. Every row above is taught in this part with verified examples — pick by who reads the file next, not by habit.",
        },
        {
          kind: "tryIt",
          title: "Round-trip your own pack",
          task: "Press Run to save, load and verify a single .npy, then a two-array .npz — all inside the playground's virtual /tmp. Then experiment: change the dtype to np.float32 and check the round trip still prints True; add a third array to the npz and find its key in the printed list.",
          code: `import numpy as np

a = np.arange(6, dtype=np.int32).reshape(2, 3)
np.save("/tmp/playground.npy", a)
b = np.load("/tmp/playground.npy")

print("dtype survived :", a.dtype == b.dtype)
print("shape survived :", a.shape == b.shape)
print("values survived:", np.array_equal(a, b))

np.savez("/tmp/playground.npz", readings=b, doubled=b * 2)
pack = np.load("/tmp/playground.npz")
print("keys:", sorted(pack.files))
print("doubled:")
print(pack["doubled"])
`,
          hint: "The playground's /tmp is virtual but real to NumPy — save and load work exactly like on your machine. Try saving b * 1.5 (float64) under a new key and reading it back.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "np.save photographs one array (header + raw bytes, nothing lost). np.savez packs many arrays by name, compressed when space matters. np.load refuses pickles from strangers. And mmap_mode lets a file pretend to be RAM — so even an 80 GB array is just a slice away.",
        },
      ],
      terms: [
        { term: ".npy", definition: "NumPy's single-array binary file: a small header (dtype, shape, memory order) followed by the array's raw bytes. Loads with zero parsing and zero loss." },
        { term: ".npz / NpzFile", definition: "A zip archive of named arrays written by np.savez or np.savez_compressed. np.load returns a lazy NpzFile; each member is read only when you access its key." },
        { term: "Pickle / allow_pickle", definition: "Python's object serialization, used for object arrays. A pickle can execute code while loading, so np.load refuses it unless you explicitly pass allow_pickle=True — untrusted files stay unpickled." },
        { term: "Memory mapping (memmap)", definition: "An array view whose buffer is a disk file: the OS pages data in as you touch it, so slices of a file bigger than RAM can be computed on a small machine." },
        { term: "Lazy loading", definition: "Deferring the real work until access: an NpzFile reads its table of contents up front but only decompresses a member when you index it." },
      ],
      mistakes: [
        {
          mistake: "Opening a .npy file in a text editor, tweaking it, and saving.",
          why: "The payload is raw binary bytes; an editor re-encodes or 'fixes' them, silently corrupting the array.",
          fix: "Edit arrays in Python (load, modify, save). Reserve text formats for files that are meant to be text.",
        },
        {
          mistake: "Expecting np.load('pack.npz') to return an array.",
          why: "An archive holds many arrays, so you get an NpzFile object — indexing it by key is what materializes an ndarray.",
          fix: "pack = np.load('pack.npz'); then pack['measurements'] gives the array you want.",
        },
        {
          mistake: "Forgetting flush() (or del) on a writable memory map before another process reads the file.",
          why: "Written pages live in the OS cache until flushed; another reader (or a crash) can miss the tail of your changes.",
          fix: "Call mm.flush() at the end of every writing stage — it is one line and it is always cheap.",
        },
        {
          mistake: "Doing whole-array work on a huge memory map and running out of RAM anyway.",
          why: "mm.sum() or mm[:] touches every page — the file flows through memory after all, defeating the entire point of mapping.",
          fix: "Compute window by window and accumulate a small running result (the chunking pattern in Lesson j-03).",
        },
      ],
      takeaways: [
        "np.save / np.load round-trip ONE array exactly: dtype, shape, strides and values all survive, because the file is header + raw bytes, not a re-typed description.",
        "A .npy file is a tiny header (dtype code, shape, memory order) plus the payload — loading means allocating and streaming, never parsing.",
        "np.savez packs many arrays by keyword into one .npz; loading is lazy, and np.savez_compressed trades some CPU for a much smaller file when data has structure.",
        "np.load refuses pickled object arrays by default (allow_pickle=False) — plain numeric files load fine, and untrusted files stay unpickled.",
        "mmap_mode='r' (or np.memmap) makes a disk file look like an array: slices pull in only the pages they need, so arrays bigger than RAM become computable one window at a time.",
      ],
      quiz: [
        {
          id: "j-01-q1",
          prompt: "After `np.save('s.npy', a)` and `b = np.load('s.npy')`, which properties are guaranteed identical between a and b?",
          options: [
            { text: "Only the values — dtype and shape may be normalized by the file format", correct: false, feedback: "Nothing is normalized: the header records the dtype and shape precisely so the exact array can be rebuilt." },
            { text: "Values, dtype, shape and memory order — the round trip is exact", correct: true, feedback: "Right: the file stores the description plus the raw bytes, so the identical machine comes back." },
            { text: "Everything including the variable name a", correct: false, feedback: "Variable names live in your code, never in the file. The keyword names in .npz archives are keys, not variable bindings." },
            { text: "Nothing is guaranteed — you must always re-check dtype and shape", correct: false, feedback: "The guarantees are strong; checking after a load is still a professional habit because it catches the WRONG FILE, not format loss." },
          ],
          explanation: "Binary persistence is a photograph of the block: header (dtype, shape, order) + payload, so the rebuild is exact.",
        },
        {
          id: "j-01-q2",
          prompt: "You need to store a measurements matrix, a labels vector and a version number, all in ONE file, loading each by name. The right call is:",
          options: [
            { text: "np.save three times with the same filename", correct: false, feedback: "Each np.save overwrites the file with one array — the last write wins and the rest are gone." },
            { text: "np.savez with keyword names (measurements=..., labels=..., version=...)", correct: true, feedback: "Exactly: one .npz archive, each array under its own key, loaded lazily by name." },
            { text: "np.save with a 3-D object array of the three things", correct: false, feedback: "That would require pickle — refused by np.load's security default and a bad idea for sharing plain numbers." },
            { text: "np.savetxt with everything in one big text column", correct: false, feedback: "Possible in text, but lossy by choice and much slower to load — and you lose the by-name access." },
          ],
          explanation: "np.savez is the many-arrays-one-file tool; keyword names become the archive keys.",
        },
        {
          id: "j-01-q3",
          prompt: "np.load raises ValueError: Object arrays cannot be loaded when allow_pickle=False. What happened, and what should you do?",
          options: [
            { text: "The file is corrupted; delete it and re-save", correct: false, feedback: "It is not corruption — it is the security guard refusing to unpickle an object array." },
            { text: "The file contains pickled object arrays and np.load's default refuses to unpickle them; load it only if you trust its source, by passing allow_pickle=True", correct: true, feedback: "Correct: the refusal is a feature. Opt in deliberately, and only for files you or trusted colleagues created." },
            { text: "Your NumPy version is too old for object arrays", correct: false, feedback: "Object arrays are supported in every relevant version; the guard is about safety, not capability." },
            { text: "You must convert the file to .npz first", correct: false, feedback: "The format is not the issue — the pickled contents are. The right fix is plain typed arrays, not a different container." },
          ],
          explanation: "Pickle can execute code while loading, so the default keeps untrusted files unpickled; plain numeric arrays never hit this error.",
        },
        {
          id: "j-01-q4",
          prompt: "What does memory mapping buy you, exactly?",
          options: [
            { text: "It makes every operation on the array faster than in-RAM arrays", correct: false, feedback: "Paging from disk is slower than RAM — the win is capacity, not per-operation speed." },
            { text: "The array's bytes stay on disk and pages are fetched only as your code touches them, so slices of files bigger than RAM become computable", correct: true, feedback: "Exactly: same ndarray behavior, bytes on disk, work window by window." },
            { text: "It compresses the array so it fits in RAM", correct: false, feedback: "No compression at all — the bytes are the bytes. Compressed archives are a different tool (savez_compressed)." },
            { text: "It duplicates the file across processes for safety", correct: false, feedback: "The opposite: processes SHARE one mapping of one file — that sharing is a feature for read-only datasets." },
          ],
          explanation: "memmap changes WHERE the bytes live; the OS pages them in on demand. Touch only the windows you need (mm.sum() on a huge map would page in everything).",
        },
      ],
    },
    // ------------------------------------------------------------- j-02
    {
      slug: "j-02",
      title: "Text Files: savetxt, loadtxt, genfromtxt",
      minutes: 25,
      summary:
        "Move arrays through human-readable CSV text: savetxt with the format string that decides round-trip fidelity, loadtxt with skiprows, usecols and the one-row shape trap, the precision cliff that makes text lossy BY CHOICE, and genfromtxt for files with gaps.",
      kind: "concept",
      objectives: [
        "Write arrays to text files with np.savetxt, controlling the number format with fmt, the separator with delimiter, and a comment header line with header",
        "Read text back with np.loadtxt, using skiprows to skip header lines, usecols to pick columns, and ndmin=2 to keep single-row files 2-D",
        "Prove the precision cliff: a %.2f round trip is NOT equal to the original, while enough decimals can round-trip exactly — and explain why text formats are lossy by choice",
        "Read messy files with np.genfromtxt: gaps become nan by default, filling_values replaces them, and names=True turns the header into field names you can index",
        "Decide when a CSV is the wrong tool entirely and the file belongs to pandas instead",
      ],
      why: "Binary formats (Lesson j-01) are perfect machine-to-machine — and useless the moment a human, a spreadsheet, or a logging script from another team is involved. CSV is the lingua franca of data: every tool reads it, every person can eyeball it, and it survives email. But text has a property binary never has: writing it forces you to choose how many digits survive, and the wrong choice silently corrupts your data in a way dtype checks cannot catch. This lesson makes that choice explicit and provable, teaches the three text functions and their sharp edges (the one-row shape trap, the plain header that crashes loadtxt), and — honestly — tells you when to stop forcing NumPy at a file that pandas should read instead.",
      blocks: [
        {
          kind: "text",
          text: "Lesson j-01 gave you the **photograph**: .npy stores the exact bytes, and loading rebuilds the identical array. Text files are a different deal entirely — they are a **transcription**. `np.savetxt` converts every value to *characters* a human can read, and `np.loadtxt` parses those characters back into numbers. Whenever data crosses through characters, two new things can go wrong: the *shape* can be misunderstood, and the *precision* can be lost. Both are avoidable — once you know where the cliffs are.",
        },
        {
          kind: "text",
          text: "Why accept a lossy transcription at all? Because CSV is the format **every** tool speaks: spreadsheets open it, editors display it, `git diff` shows what changed in it, and a colleague can sanity-check a value with their eyes. Binary is for machines; text is for humans. Real pipelines use both: .npy for checkpoints between stages (Lesson j-01), CSV at the boundaries where people or other tools touch the data.",
        },
        {
          kind: "heading",
          text: "savetxt: your array as characters",
        },
        {
          kind: "text",
          text: "The writer takes a 1-D or 2-D array and turns it into lines of text. Three arguments do almost all the work: `fmt` (how each number is printed), `delimiter` (what separates values on a line), and `header` (a comment line naming the columns). Watch a small sensor grid become a file:",
        },
        {
          kind: "code",
          title: "A grid becomes a CSV file",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

grid = np.array([[21.537, 19.281, 22.604],
                 [18.125, 20.750, 17.900],
                 [23.010, 22.334, 24.875]])
np.savetxt("/tmp/numpy-course/grid.csv", grid, delimiter=",", fmt="%.3f",
           header="temp,pressure,humidity")

print(open("/tmp/numpy-course/grid.csv").read(), end="")
`,
          output: `# temp,pressure,humidity
21.537,19.281,22.604
18.125,20.750,17.900
23.010,22.334,24.875`,
          outputNote:
            "Three data rows, one value per column, exactly as a spreadsheet would show them. Notice the header line begins with '# ' — that prefix is savetxt's default way of marking it as a comment.",
          explain: [
            "`fmt=\"%.3f\"` is a printf-style format (Python's % operator): point-3-decimal fixed notation. Every value is written with exactly three digits after the decimal point.",
            "`delimiter=\",\"` puts a comma between values on each line — that is literally what makes it a CSV (comma-separated values) file.",
            "`header=\"temp,pressure,humidity\"` writes one extra line before the data. It is stored as a *comment*: savetxt prepends `\"# \"` (its `comments` argument) so readers can tell metadata from data.",
            "Only 1-D and 2-D arrays can be saved as text — a grid of characters is inherently a table. Use .npy (Lesson j-01) for anything higher-dimensional.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.savetxt",
          purpose: "Write a 1-D or 2-D array to a text file as human-readable lines, with a number format you control exactly.",
          signature: "np.savetxt(fname, X, fmt='%.18e', delimiter=' ', newline='\\n', header='', footer='', comments='# ', encoding=None)",
          purposeDetail:
            "np.savetxt is the text-world counterpart of np.save. Instead of photographing the raw bytes, it formats every value into characters using the fmt string you choose — which means YOU decide how much precision survives the trip. Use it when the file must be readable by humans, spreadsheets, or non-NumPy tools, and accept that text is lossy by choice: a coarse format quietly rounds your data, while a generous one keeps it exact. For machine-to-machine round trips where nothing may change, np.save is always the better tool.",
          params: [
            {
              name: "fname",
              type: "str, Path, or file object",
              required: true,
              description: "Target path. Parent directories must exist. If the name ends in .gz the file is written gzip-compressed — and np.loadtxt reads it back transparently.",
              example: '"/tmp/readings.csv"',
            },
            {
              name: "X",
              type: "1-D or 2-D array_like",
              required: true,
              description: "The data to write. 1-D writes one value per line; 2-D writes one line per row with delimiter between the columns. 3-D and higher raise an error — text is a table format.",
              example: "grid",
            },
            {
              name: "fmt",
              type: "str or sequence of str",
              description: "printf-style format for the values: \"%.3f\" (three decimals), \"%d\" (integers), \"%s\" (strings), or a list like (\"%d\", \"%.6f\") for per-column formats. The default \"%.18e\" keeps 18 significant digits — enough for nearly every float64 round trip.",
              example: 'fmt="%.3f"',
            },
            {
              name: "delimiter",
              type: "str",
              description: "String placed between values on a line. Default is a single space; \",\" makes a CSV, \";\" pleases European spreadsheets, \"\\t\" makes a TSV.",
              example: 'delimiter=","',
            },
            {
              name: "header",
              type: "str",
              description: "A line written before the data (typically column names). It is prefixed with the comments string so readers treat it as metadata, not data.",
              example: 'header="temp,pressure"',
            },
            {
              name: "comments",
              type: "str",
              description: 'The prefix stamped onto header and footer lines — "# " by default. Pass comments="" to write a truly plain header line (then readers need skiprows=1, see np.loadtxt).',
              example: 'comments="# "',
            },
          ],
          returns: {
            type: "None",
            description: "Writes the file as a side effect; nothing is returned.",
          },
          example: `import numpy as np

# 1-D: one value per line (delimiter unused)
temps = np.array([21.5, 18.0, 19.25])
np.savetxt("/tmp/temps.txt", temps, fmt="%.2f")

# 2-D: comma-separated with a labeled comment line
readings = np.array([[21.537, 19.281],
                     [18.125, 20.750]])
np.savetxt("/tmp/readings.csv", readings, delimiter=",", fmt="%.3f",
           header="temp,pressure")

print("--- /tmp/temps.txt ---")
print(open("/tmp/temps.txt").read(), end="")
print("--- /tmp/readings.csv ---")
print(open("/tmp/readings.csv").read(), end="")
`,
          exampleOutput: `--- /tmp/temps.txt ---
21.50
18.00
19.25
--- /tmp/readings.csv ---
# temp,pressure
21.537,19.281
18.125,20.750`,
          commonMistakes: [
            {
              mistake: "Saving with a coarse fmt and expecting an exact round trip.",
              why: "fmt=\"%.2f\" writes two decimals — anything finer in your data is rounded away permanently. The file looks fine; the precision is gone.",
              fix: "Decide the fidelity up front: use enough decimals for the data's real precision (\"%.8f\" is plenty for typical sensor values), or use np.save when exactness is required.",
            },
            {
              mistake: "Writing with delimiter=\",\" but reading with np.loadtxt's default splitting.",
              why: "loadtxt with no delimiter splits on whitespace. A line like 21.537,19.281 is one unparseable token to it, and it crashes with a conversion error.",
              fix: "The writer and reader must agree: pass delimiter=\",\" to BOTH np.savetxt and np.loadtxt.",
            },
            {
              mistake: "Expecting header lines to carry through into the loaded array.",
              why: "The header is a comment; loadtxt skips comments and returns pure numbers. Column names live in the file, not in the array.",
              fix: "Keep names in the header for humans, and document the column order in code. genfromtxt with names=True can read them back as field names.",
            },
          ],
          related: [
            { name: "np.loadtxt", relation: "The matching reader — fast and strict, for clean numeric files." },
            { name: "np.genfromtxt", relation: "The tolerant reader — handles gaps, missing markers and named columns that loadtxt refuses." },
            { name: "np.save", relation: "The binary writer — exact round trip, no format decisions, no human readability (Lesson j-01)." },
            { name: "np.savez_compressed", relation: "Many arrays in one binary archive when text is not needed at all." },
          ],
          applications: [
            "Exporting a results table a colleague can open in a spreadsheet and eyeball",
            "Interchange with non-Python tools that speak CSV but not .npy",
            "Small human-auditable snapshots in git: diffs show exactly which values changed",
          ],
          notes:
            "Ending the filename in .gz writes a gzip-compressed text file automatically, and np.loadtxt decompresses on the fly — a cheap way to make big CSVs smaller without changing your reading code.",
        },
        {
          kind: "heading",
          text: "Reading it back: np.loadtxt",
        },
        {
          kind: "text",
          text: "`np.loadtxt` parses the file into a float array (by default). It is the fast, strict member of the family: every field must be a number, and the grid must be rectangular. Its three most important arguments are the ones that fix *what* gets read: `skiprows` (skip header lines), `usecols` (pick columns), and `ndmin` (guarantee dimensions). First, the happy path with the file we just wrote:",
        },
        {
          kind: "code",
          title: "loadtxt: the header is skipped, the values come back",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

grid = np.array([[21.537, 19.281, 22.604],
                 [18.125, 20.750, 17.900],
                 [23.010, 22.334, 24.875]])
np.savetxt("/tmp/numpy-course/grid.csv", grid, delimiter=",", fmt="%.3f",
           header="temp,pressure,humidity")

# comments ("# ...") are skipped automatically -- savetxt's header is one
back = np.loadtxt("/tmp/numpy-course/grid.csv", delimiter=",")
print("shape:", back.shape, " dtype:", back.dtype)
print("round trip:", np.array_equal(back, grid))

picked = np.loadtxt("/tmp/numpy-course/grid.csv", delimiter=",", usecols=(2,))
print("column 2 only:", picked, picked.shape)
`,
          output: `shape: (3, 3)  dtype: float64
round trip: True
column 2 only: [22.604 17.9   24.875] (3,)`,
          outputNote:
            "The # header line was skipped without any skiprows argument — loadtxt ignores comment lines by default. usecols=(2,) pulled just the humidity column as a 1-D array.",
          explain: [
            "The round trip is exact here because the values were dyadic (three decimals fit float64 perfectly) AND fmt kept all three. The next section shows what happens when either half of that sentence fails.",
            "`usecols=(2,)` selects columns before parsing — pass a tuple of indexes, and you can even reorder: usecols=(2, 0) returns humidity first.",
            "dtype is float64, loadtxt's default; pass dtype=int (or any NumPy dtype) to parse straight into it.",
          ],
        },
        {
          kind: "text",
          text: "Now the trap that bites everyone exactly once. A CSV with **a single row** of data loads as a 1-D array — loadtxt cannot know those three numbers were *a row of one station* rather than *a vector of three readings*. Downstream code that expects a 2-D table then crashes or, worse, quietly computes the wrong thing. `ndmin=2` is the fix — it guarantees the result is at least 2-D, prepending a length-1 axis when needed:",
        },
        {
          kind: "code",
          title: "The one-row trap, and ndmin=2",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

# one station, three sensors -> a single CSV row
one_row = np.array([[21.5, 19.0, 22.25]])
np.savetxt("/tmp/numpy-course/one.csv", one_row, delimiter=",", fmt="%.2f")

back = np.loadtxt("/tmp/numpy-course/one.csv", delimiter=",")
back2 = np.loadtxt("/tmp/numpy-course/one.csv", delimiter=",", ndmin=2)

print("default shape:", back.shape)
print("ndmin=2 shape :", back2.shape)
print("values survive:", np.array_equal(back, one_row.ravel()))
`,
          output: `default shape: (3,)
ndmin=2 shape : (1, 3)
values survive: True`,
          outputNote:
            "Same file, same values, two different shapes: (3,) by default, (1, 3) with ndmin=2. The values were never the problem — the dimensionality was.",
          explain: [
            "loadtxt squeezes a single-row file down to 1-D, exactly like a[0] on a 2-D array gives a 1-D row (Part D).",
            "`ndmin=2` keeps it a (1, 3) table, so code written for 2-D sensor grids works whether the file held one row or ten thousand.",
            "The same trick handles single-COLUMN files: without ndmin they also come back as (n,), not (n, 1).",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.loadtxt",
          purpose: "Parse a text file (CSV and friends) into a NumPy array — the fast, strict reader for clean numeric data.",
          signature: "np.loadtxt(fname, dtype=<class 'float'>, comments='#', delimiter=None, skiprows=0, usecols=None, unpack=False, ndmin=0, encoding=None, max_rows=None, *, quotechar=None, like=None)",
          purposeDetail:
            "np.loadtxt is the standard way back from np.savetxt. It streams through the file, skips comment lines, splits each line on the delimiter, converts every field to the dtype you asked for, and assembles one rectangular array. It is strict by design: one gap, one word where a number should be, one ragged line — and it raises an error rather than guessing. When files ARE that clean, loadtxt is faster and simpler than anything else in the text toolbox; when they are not, that is genfromtxt's job.",
          params: [
            {
              name: "fname",
              type: "str, Path, or file object",
              required: true,
              description: "The file to read. .gz files are decompressed transparently.",
              example: '"/tmp/grid.csv"',
            },
            {
              name: "dtype",
              type: "dtype",
              description: "The array's element type; every field must convert. float by default; dtype=str keeps text; dtype=int parses whole numbers.",
              example: "dtype=str",
            },
            {
              name: "comments",
              type: "str or sequence of str",
              description: "Prefixes marking lines to ignore entirely, \"#\" by default — this is why savetxt's header costs nothing.",
              example: 'comments="#"',
            },
            {
              name: "delimiter",
              type: "str",
              description: "The field separator. None (default) splits on any run of whitespace; \",\" for CSV files written with a delimiter.",
              example: 'delimiter=","',
            },
            {
              name: "skiprows",
              type: "int",
              description: "Skip this many lines from the top before parsing — the fix for plain (non-comment) header lines.",
              example: "skiprows=1",
            },
            {
              name: "usecols",
              type: "tuple of int",
              description: "Read only these columns (0-based), in the order given. Skips parsing work for columns you do not want.",
              example: "usecols=(0, 2)",
            },
            {
              name: "ndmin",
              type: "int",
              description: "Minimum number of dimensions for the result (0, 1 or 2). ndmin=2 stops single-row and single-column files from collapsing to 1-D.",
              example: "ndmin=2",
            },
          ],
          returns: {
            type: "ndarray",
            description: "One rectangular array of the requested dtype. A single-row file yields a 1-D array unless ndmin=2 says otherwise.",
          },
          example: `import numpy as np

np.savetxt("/tmp/card.csv", np.array([[1.5, 2.0, 3.5],
                                      [4.0, 5.5, 6.0]]),
           delimiter=",", fmt="%.2f", header="a,b,c")

everything = np.loadtxt("/tmp/card.csv", delimiter=",")
picked = np.loadtxt("/tmp/card.csv", delimiter=",", usecols=(0, 2))
forced = np.loadtxt("/tmp/card.csv", delimiter=",", ndmin=2)

print("all columns:", everything.tolist())
print("usecols 0,2:", picked.tolist())
print("ndmin=2 shape:", forced.shape)
`,
          exampleOutput: `all columns: [[1.5, 2.0, 3.5], [4.0, 5.5, 6.0]]
usecols 0,2: [[1.5, 3.5], [4.0, 6.0]]
ndmin=2 shape: (2, 3)`,
          commonMistakes: [
            {
              mistake: "Loading a file with a plain header line and no skiprows.",
              why: "A header like temp,pressure is not a comment (no # prefix), so loadtxt tries to parse the words as numbers and raises ValueError.",
              fix: "skiprows=1, or ask the writer to use savetxt's default comments prefix so the line is skipped automatically.",
            },
            {
              mistake: "Being surprised that a one-row file came back 1-D.",
              why: "loadtxt squeezes singleton dimensions away; a (1, 3) table and a (3,) vector are the same characters in the file.",
              fix: "Pass ndmin=2 whenever downstream code assumes a 2-D table.",
            },
            {
              mistake: "Forgetting the delimiter on either side.",
              why: "Writing with delimiter=\",\" but reading with the default whitespace splitting (or the reverse) makes the two sides disagree about where fields start.",
              fix: "Use the same delimiter argument in savetxt and loadtxt — put it in one shared constant in real pipelines.",
            },
          ],
          related: [
            { name: "np.savetxt", relation: "The writer this function pairs with; agree on delimiter and precision." },
            { name: "np.genfromtxt", relation: "The tolerant sibling for files with gaps, missing markers or named columns." },
            { name: "np.load", relation: "Binary reading — exact and much faster, when humans never see the file (Lesson j-01)." },
            { name: "np.memmap", relation: "For huge arrays that must not be loaded whole — impossible with text formats." },
          ],
          applications: [
            "Reading instrument exports, sensor logs and spreadsheet saves (clean, numeric, rectangular)",
            "Loading only the columns you need with usecols — less parsing, less memory",
            "Reloading your own savetxt output with a round-trip check in test suites",
          ],
          notes:
            "For genuinely messy real-world CSVs — mixed types, dates, thousands of columns, encodings — pandas.read_csv is the professional tool; see the handoff callout below.",
        },
        {
          kind: "heading",
          text: "The plain-header trap",
        },
        {
          kind: "text",
          text: "savetxt protects you by writing headers as comments, but the wider world does not: half the CSVs you will ever receive start with a plain `temp,pressure` line and no `#`. loadtxt treats those words as data and refuses loudly. Watch the crash, then the one-argument fix:",
        },
        {
          kind: "code",
          title: "What loadtxt says to a plain header",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

# a colleague's CSV: plain header line, no # prefix
with open("/tmp/numpy-course/plain.csv", "w") as f:
    f.write("temp,pressure\\n21.5,1013.2\\n19.1,1008.7\\n")

row = np.loadtxt("/tmp/numpy-course/plain.csv", delimiter=",")
`,
          expectError:
            "ValueError: could not convert string 'temp' to float64 at row 0, column 1.",
          outputNote:
            "The error names the exact culprit: the word 'temp' at row 0, column 1 — your header, being read as data. The row/column coordinates in the message map straight onto the file, which makes this one of NumPy's friendliest errors.",
          explain: [
            "loadtxt has no concept of column names; it sees characters that must become floats, and 'temp' cannot.",
            "Notice the message says row 0, column 1 — NumPy counts both from zero (and columns from 1 in this message). You can locate the bad cell without opening the file.",
            "The fix is next: skip the line before parsing.",
          ],
        },
        {
          kind: "code",
          title: "skiprows=1: the same file, read correctly",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

with open("/tmp/numpy-course/plain.csv", "w") as f:
    f.write("temp,pressure\\n21.5,1013.2\\n19.1,1008.7\\n")

fixed = np.loadtxt("/tmp/numpy-course/plain.csv", delimiter=",", skiprows=1)
print("skiprows=1 shape:", fixed.shape)
print(fixed.tolist())
`,
          output: `skiprows=1 shape: (2, 2)
[[21.5, 1013.2], [19.1, 1008.7]]`,
          outputNote:
            "One argument, and the words are gone before parsing starts. genfromtxt offers a second option for this situation: names=True reads that header line as field names instead of skipping it.",
          explain: [
            "`skiprows=1` drops the first line unconditionally — use it for any preamble: units lines, generator banners, blank lines at the top.",
            "`max_rows` is the bottom-of-file twin: read only the first N data rows (handy for sampling a huge log).",
            "If you need the column names as well as the numbers, that is genfromtxt(names=True) — coming up.",
          ],
        },
        {
          kind: "heading",
          text: "The precision cliff: text is lossy by choice",
        },
        {
          kind: "text",
          text: "Here is the most important experiment in the lesson. The same five temperatures, saved twice — once with two decimals, once with eight — and read back. Watch which round trip is exact:",
        },
        {
          kind: "code",
          title: "%.2f loses, %.8f keeps — proven, not assumed",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

temps = np.array([21.537, 19.281, 22.604, 18.125, 20.750])
np.savetxt("/tmp/numpy-course/t2.csv", temps, fmt="%.2f")   # 2 decimals
np.savetxt("/tmp/numpy-course/t8.csv", temps, fmt="%.8f")   # 8 decimals

back2 = np.loadtxt("/tmp/numpy-course/t2.csv")
back8 = np.loadtxt("/tmp/numpy-course/t8.csv")

print("original      :", temps)
print("back from %.2f:", back2)
print("back from %.8f:", back8)
print("equal after %.2f:", np.array_equal(temps, back2))
print("equal after %.8f:", np.array_equal(temps, back8))
`,
          output: `original      : [21.537 19.281 22.604 18.125 20.75 ]
back from %.2f: [21.54 19.28 22.6  18.12 20.75]
back from %.8f: [21.537 19.281 22.604 18.125 20.75 ]
equal after %.2f: False
equal after %.8f: True`,
          outputNote:
            "The %.2f file lost the third decimal of every value (21.537 became 21.54) — array_equal says False. With eight decimals, every value came back bit-for-bit: True.",
          explain: [
            "This is not a bug or a rounding accident — it is the format working exactly as specified. `%.2f` MEANS at most two decimals; the rest are unwritten, forever.",
            "%.8f round-trips these values exactly because they never needed more than three decimals. Numbers whose binary expansion is infinite (like 0.1 + 0.2) can still need all 17 significant digits of float64 — for those, even %.8f is lossy and only np.save is exact.",
            "The professional habit: choose fmt from the data's real precision, and add a round-trip assertion in tests so a format change cannot silently degrade the pipeline.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Choosing fmt without agonizing",
          text: "Rules of thumb that cover almost every case: integers -> %d. Measurements whose finest honest digit is 3 decimals -> \"%.3f\" (one more than you display, one fewer than you fear). Full float64 fidelity -> \"%.18e\" (savetxt's default) or, better, np.save. Never use text as an intermediate checkpoint when exactness matters — that is what .npy and .npz are for. And whatever you choose, write it down where the file is read.",
        },
        {
          kind: "heading",
          text: "genfromtxt: the tolerant reader",
        },
        {
          kind: "text",
          text: "Real logs have holes: a sensor drops out, a line gets truncated, a field arrives empty. `np.loadtxt` refuses such files — strictness is its job. `np.genfromtxt` is the tolerant cousin: it replaces what it cannot parse with `nan` (not a number) and keeps going. From there you decide what a gap MEANS: keep the nan, or fill it with a sentinel you choose. It can also read the header line as **field names**, so columns become addressable as `data[\"temp\"]`:",
        },
        {
          kind: "code",
          title: "Gaps, nans, filling values, and named fields",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

# a log with two gaps: an empty temp on day 2, an empty hum on day 3
with open("/tmp/numpy-course/gaps.csv", "w") as f:
    f.write("day,temp,hum\\n1,21.5,55\\n2,,48\\n3,19.2,\\n4,20.1,60\\n")

# default behavior: whatever cannot be parsed becomes nan
raw = np.genfromtxt("/tmp/numpy-course/gaps.csv", delimiter=",", names=True)
print("raw temp :", raw["temp"])
print("nan count:", int(np.isnan(raw["temp"]).sum()))

# our choice: every gap is a sensor dropout, so fill it with -1
filled = np.genfromtxt("/tmp/numpy-course/gaps.csv", delimiter=",", names=True,
                       missing_values="", filling_values=-1.0)
print("filled temp:", filled["temp"])
print("filled hum :", filled["hum"])
print("field names:", filled.dtype.names)
`,
          output: `raw temp : [21.5  nan 19.2 20.1]
nan count: 1
filled temp: [21.5 -1.  19.2 20.1]
filled hum : [55. 48. -1. 60.]
field names: ('day', 'temp', 'hum')`,
          outputNote:
            "The gap on day 2 became nan by default (and was counted), then -1.0 with filling_values. The header line became field names: data[\"temp\"] is the temp column, no column indexes needed.",
          explain: [
            "`names=True` consumed the plain header line (no skiprows needed — genfromtxt recognized it) and produced a *structured array*: one named field per column (a cameo of Part B's structured dtypes — the full story lives in the NumPy docs).",
            "`missing_values=\"\"` declares that empty fields are missing data; `filling_values=-1.0` is the sentinel to substitute. You can pass dicts to handle each column differently.",
            "Notice what was NOT printed: the day column — `raw[\"day\"]` would give [1. 2. 3. 4.]. Named fields mean you read what you need by name.",
            "Tolerance is not free: genfromtxt is markedly slower than loadtxt because it must inspect every field. Clean file -> loadtxt; suspect file -> genfromtxt.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.genfromtxt",
          purpose: "Read text files that loadtxt cannot stomach: gaps, missing markers, and header lines you want as field names.",
          signature: "np.genfromtxt(fname, dtype=<class 'float'>, comments='#', delimiter=None, skip_header=0, skip_footer=0, converters=None, missing_values=None, filling_values=None, usecols=None, names=None, excludelist=None, ...)",
          purposeDetail:
            "np.genfromtxt exists for the files reality produces. Where loadtxt demands a perfect numeric rectangle, genfromtxt inspects every field: anything it cannot convert is treated as missing and becomes nan (or a value you choose), the rest of the file still loads, and a header line can become named fields you access as data[\"temp\"] instead of column indexes. You pay for the tolerance with speed — it is substantially slower than loadtxt — so the professional split is: loadtxt for files you generate yourself, genfromtxt for files the world sends you, pandas.read_csv when even genfromtxt starts to feel thin.",
          params: [
            {
              name: "fname",
              type: "str, Path, or file object",
              required: true,
              description: "The file to read; .gz and .bz2 archives are decompressed transparently.",
              example: '"/tmp/gaps.csv"',
            },
            {
              name: "delimiter",
              type: "str",
              description: "Field separator. None splits on whitespace — but note the default dtype here is float, so pass the delimiter your file actually uses.",
              example: 'delimiter=","',
            },
            {
              name: "names",
              type: "bool, None, or sequence of str",
              description: "True reads the first line (after skip_header) as field names and returns a structured array; a list supplies names yourself.",
              example: "names=True",
            },
            {
              name: "missing_values",
              type: "str, sequence, or dict",
              description: "What counts as missing: empty fields (\"\"), specific strings like \"NA\" or \"-\", or a per-column dict. Missing fields become nan (or filling_values).",
              example: 'missing_values=""',
            },
            {
              name: "filling_values",
              type: "value or dict",
              description: "The value substituted for missing fields instead of nan — a sentinel your downstream code can test for, like -1 for a dropped sensor.",
              example: "filling_values=-1.0",
            },
            {
              name: "skip_header / skip_footer",
              type: "int",
              description: "Lines to ignore at the top / bottom of the file before parsing (genfromtxt's names for loadtxt's skiprows idea, plus a footer twin).",
              example: "skip_header=1",
            },
          ],
          returns: {
            type: "ndarray (structured when names is set)",
            description: "A plain array of parsed values, or a structured array with one named field per column when names is used.",
          },
          example: `import numpy as np

with open("/tmp/scores.csv", "w") as f:
    f.write("student,math,art\\n"
            "1,90,\\n"
            "2,,72\\n"
            "3,85,78\\n")

scores = np.genfromtxt("/tmp/scores.csv", delimiter=",", names=True,
                      missing_values="", filling_values=0)

print("math :", scores["math"])
print("art  :", scores["art"])
print("names:", scores.dtype.names)
`,
          exampleOutput: `math : [90.  0. 85.]
art  : [ 0. 72. 78.]
names: ('student', 'math', 'art')`,
          commonMistakes: [
            {
              mistake: "Reaching for genfromtxt on every file out of caution.",
              why: "The field-by-field inspection that makes it tolerant also makes it slow — often several times slower than loadtxt on clean data.",
              fix: "Start with loadtxt; upgrade to genfromtxt only when the file actually has gaps, markers or names to handle.",
            },
            {
              mistake: "Forgetting that gaps become nan, then averaging a column full of them.",
              why: "nan is contagious by design (Part C): any mean or sum over a nan becomes nan, quietly poisoning every statistic built on it.",
              fix: "Fill deliberately (filling_values), or filter with ~np.isnan(col) before computing — never average a column you have not audited for nan.",
            },
            {
              mistake: "Expecting names=True to return an ordinary 2-D array.",
              why: "Named columns cannot live in a plain grid of one dtype; you get a structured array whose fields you access by name, not by column index.",
              fix: "Use data[\"temp\"] for the column you want; convert with np.asarray(data[\"temp\"]) when plain-array methods are needed.",
            },
          ],
          related: [
            { name: "np.loadtxt", relation: "The fast, strict sibling — right choice whenever the file is clean and numeric." },
            { name: "np.isnan", relation: "Detects the nan gaps genfromtxt leaves behind, so you can handle them before they spread (Part C)." },
            { name: "np.savetxt", relation: "Writes text files; does not understand names — headers are comments to it." },
            { name: "pandas.read_csv", relation: "The industrial-strength CSV reader for genuinely messy files (see the handoff callout)." },
          ],
          applications: [
            "Instrument and IoT logs where sensors drop out mid-stream",
            "Files from other teams that mark missing data as NA, n/a, ? or blanks",
            "Any CSV where you want to address columns by name instead of index",
          ],
          notes:
            "Structured arrays (what names=True returns) are a cameo here — one dtype per named column, indexed by string. They predate pandas and remain useful for light tabular work inside pure NumPy.",
        },
        {
          kind: "heading",
          text: "When the file holds words, not numbers",
        },
        {
          kind: "text",
          text: "loadtxt defaults to float, but text files often legitimately contain strings: station codes, labels, categories. `dtype=str` tells the reader to keep every field as text, and the result is a proper unicode-dtype array (Part B's `<U` codes) that slices and compares like any array:",
        },
        {
          kind: "code",
          title: "Reading a file of words",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

stations = np.array(["north", "east", "south", "west"])
np.savetxt("/tmp/numpy-course/stations.txt", stations, fmt="%s")

names = np.loadtxt("/tmp/numpy-course/stations.txt", dtype=str)
print(names, names.dtype)
print("kept as text:", names[2] == "south")
`,
          output: `['north' 'east' 'south' 'west'] <U5
kept as text: True`,
          outputNote:
            "The words came back as a <U5 array: unicode strings up to 5 characters — the same dtype np.array of strings would have (Part B). Comparisons and boolean masks work unchanged.",
          explain: [
            "`fmt=\"%s\"` on the write side and `dtype=str` on the read side are the pair: one formats values as strings, the other refuses to parse them as anything else.",
            "Mixed files (a name column AND number columns) do not fit one dtype — that is structured-array or pandas territory, not loadtxt's.",
            "For the common real task of one text column beside many numeric ones, pandas.read_csv does this in its sleep — see the callout below.",
          ],
        },
        {
          kind: "arrayViz",
          title: "A file carries values AND a shape",
          mode: "explore",
          name: "weather",
          caption:
            "The 7-day x 3-metric weather table from the pipeline below, as loadtxt rebuilds it. On disk the CSV is only characters and commas; the (7, 3) grid you see here exists because line breaks ended rows and delimiters split columns. Files carry values AND shape — and the reader's job is to recover both. Hover cells to see row/column coordinates.",
          data: [
            [15.0, 18.625, 16.0],
            [19.625, 17.0, 20.625],
            [18.0, 15.375, 19.0],
            [16.375, 20.0, 17.375],
            [21.0, 18.375, 15.75],
            [19.375, 16.75, 20.375],
            [17.75, 15.125, 18.75],
          ],
          labels: {
            rows: ["day 0", "day 1", "day 2", "day 3", "day 4", "day 5", "day 6"],
            cols: ["temp_c", "wind_kmh", "rh_pct"],
          },
          dtype: "float64",
        },
        {
          kind: "callout",
          tone: "info",
          title: "The honest handoff: messy CSVs belong to pandas",
          text: "NumPy's text readers are for rectangular numeric grids. The moment a file has mixed column types, dates, thousand separators, two header rows, or a million rows you want to filter while loading, stop fighting it: pandas.read_csv does all of that in one call, and its columns convert to NumPy arrays instantly (df[\"temp\"].to_numpy()). Use NumPy files for arrays, use pandas for tables — the two libraries are designed to hand off to each other, and the best pipelines let each do its own job.",
        },
        {
          kind: "table",
          title: "Which reader, which file",
          headers: ["Function", "File looks like", "Use it when"],
          rows: [
            ["np.loadtxt", "Clean numbers, rectangular, optional # comments", "You generated the file, or trust its source; speed matters; gaps would be a bug"],
            ["np.genfromtxt", "Gaps, empty fields, NA markers, a plain names row", "The world sent you the file; tolerance beats speed; you want named columns"],
            ["np.load", ".npy / .npz binary", "Exact round trips between NumPy stages — no parsing, no loss (Lesson j-01)"],
            ["pandas.read_csv", "Real-world CSV: mixed types, dates, encodings", "The file is a table for analysis, not a grid of numbers"],
          ],
          caption:
            "Strict-fast, tolerant-slow, binary-exact, or full-table: pick by who wrote the file and what lives in it, not by habit.",
        },
        {
          kind: "heading",
          text: "The whole story in one pipeline",
        },
        {
          kind: "text",
          text: "Time to assemble every piece into the shape a real script takes: **generate -> save -> load -> verify**. The table is a deterministic 7-day weather grid (built by arithmetic, so no randomness anywhere). The fmt is chosen to match the data's precision, the header names the columns, and the pipeline ends the way every file pipeline should — with a round-trip check:",
        },
        {
          kind: "code",
          title: "Generate, save, load, verify — the full round trip",
          code: `import numpy as np
import os

os.makedirs("/tmp/numpy-course", exist_ok=True)

# 1) a deterministic 7-day x 3-metric weather table (arithmetic only)
weather = 15.0 + ((np.arange(21).reshape(7, 3) * 29) % 50) / 8.0

# 2) save as human-readable CSV: 3 decimals match the data's real precision
np.savetxt("/tmp/numpy-course/weather.csv", weather, delimiter=",", fmt="%.3f",
           header="temp_c,wind_kmh,rh_pct")

# 3) load it back and verify everything a file pipeline must guarantee
loaded = np.loadtxt("/tmp/numpy-course/weather.csv", delimiter=",")
print("table shape:", loaded.shape, " dtype:", loaded.dtype)
print(loaded)
print("round trip exact:", np.array_equal(loaded, weather))
print("daily means (rounded):", np.round(loaded.mean(axis=1), 3))
`,
          output: `table shape: (7, 3)  dtype: float64
[[15.    18.625 16.   ]
 [19.625 17.    20.625]
 [18.    15.375 19.   ]
 [16.375 20.    17.375]
 [21.    18.375 15.75 ]
 [19.375 16.75  20.375]
 [17.75  15.125 18.75 ]]
round trip exact: True
daily means (rounded): [16.542 19.083 17.458 17.917 18.375 18.833 17.208]`,
          outputNote:
            "Four things verified in one report: the shape came back as (7, 3), the dtype is float64, every value survived exactly, and downstream math (daily means, axis=1) runs on the rebuilt grid.",
          explain: [
            "The values were built as 15 + k/8 — dyadic decimals that fit in three places — and fmt=\"%.3f\" wrote all three, so the round trip is exact. Change fmt to \"%.1f\" and the last line becomes False: that is the precision cliff, now in your hands.",
            "`loaded.mean(axis=1)` is the Part F axis habit applied to loaded data: files are just another array source, and everything from nine parts of this course applies unchanged.",
            "This generate-save-load-verify loop is the template for every file pipeline you will write — only the format choice changes (.npy for machines, .csv for humans).",
          ],
        },
        {
          kind: "tryIt",
          title: "Round-trip a CSV in the playground",
          task: "Press Run to save a small CSV into the playground's virtual /tmp and load it back, then experiment: (1) change fmt to \"%.1f\" and watch the round trip print False; (2) change fmt to \"%.8f\" and watch it print True again; (3) uncomment the last two lines and compare the one-row file's shape with and without ndmin=2.",
          code: `import numpy as np

temps = np.array([21.5, 18.25, 19.0, 22.125])
np.savetxt("/tmp/playground.csv", temps, fmt="%.3f", delimiter=",")
back = np.loadtxt("/tmp/playground.csv", delimiter=",")

print("values survived:", np.array_equal(temps, back))
print("loaded shape    :", back.shape)

# one-row file: the shape trap and its fix
row = np.array([[21.5, 18.25]])
np.savetxt("/tmp/row.csv", row, fmt="%.3f", delimiter=",")
print("one-row file, default shape:", np.loadtxt("/tmp/row.csv", delimiter=",").shape)
print("one-row file, ndmin=2 shape :", np.loadtxt("/tmp/row.csv", delimiter=",", ndmin=2).shape)
`,
          hint: "The playground's /tmp is virtual but real to NumPy — savetxt and loadtxt work exactly like on your machine. After the fmt experiments, try adding usecols=(1,) to a loadtxt call and predict the shape before running.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "savetxt transcribes your array into characters — and the format string, not the file, decides what survives. loadtxt reads clean grids fast (mind the one-row shape trap and plain headers); genfromtxt tolerates gaps and names them; and when a CSV gets genuinely messy, hand it to pandas. Binary for machines, text for humans, fmt chosen on purpose.",
        },
      ],
      terms: [
        { term: "fmt string", definition: "The printf-style format (like \"%.3f\") savetxt uses to turn each value into characters — the single decision that determines round-trip fidelity." },
        { term: "delimiter", definition: "The string separating values on a line (\",\" for CSV). Writer and reader must agree on it or parsing fails." },
        { term: "skiprows / usecols / ndmin", definition: "loadtxt's selectors: skip leading lines, pick columns by index, and guarantee a minimum dimensionality so single-row files stay 2-D." },
        { term: "Lossy by choice", definition: "Text formats lose precision only because fmt chose to write fewer digits than the data has — unlike binary, which is always exact." },
        { term: "missing_values / filling_values", definition: "genfromtxt's gap handling: what counts as missing (empty fields, NA markers) and what to put in its place (nan by default, or your sentinel)." },
        { term: "Structured array", definition: "An array with named fields per column (dtype like ('day','<f8'),('temp','<f8')) — what genfromtxt(names=True) returns; columns are read as data[\"temp\"]." },
      ],
      mistakes: [
        {
          mistake: "Saving with fmt=\"%.2f\" and expecting an exact round trip.",
          why: "Two decimals is a promise to keep only two decimals; array_equal then reports False and every statistic on the reloaded data is subtly off.",
          fix: "Match fmt to the data's real precision (or use np.save for exactness), and assert the round trip in tests so regressions are loud.",
        },
        {
          mistake: "Reading a colleague's CSV that has a plain header line, without skiprows.",
          why: "loadtxt tries to parse the header words as numbers and raises ValueError, naming the offending word and its row/column.",
          fix: "skiprows=1 for the numbers; genfromtxt(names=True) if you want the names too.",
        },
        {
          mistake: "Writing a one-row table and loading it into code that expects 2-D.",
          why: "loadtxt squeezes a single-row file to shape (n,); indexing like table[0, 2] then fails or misbehaves.",
          fix: "ndmin=2 keeps it (1, n) — put it in the reader whenever the downstream contract is a 2-D grid.",
        },
        {
          mistake: "Averaging a column that genfromtxt filled with nan.",
          why: "nan is contagious: one nan in a column makes its mean nan, silently propagating into every result built on it.",
          fix: "Audit with np.isnan, then choose: fill (filling_values), filter (~isnan masks), or fix the log upstream.",
        },
      ],
      takeaways: [
        "Text files are transcriptions, not photographs: fmt decides what survives, and a coarse format is lossy by choice — proven with array_equal, not assumed.",
        "np.savetxt writes characters (fmt, delimiter, header-as-comment); np.loadtxt reads them back fast, with skiprows, usecols and ndmin=2 as the shape controls.",
        "A one-row CSV loads as 1-D — ndmin=2 keeps the table contract; a plain header crashes loadtxt and is cured by skiprows=1.",
        "np.genfromtxt is the tolerant reader: gaps become nan by default, filling_values substitutes your sentinel, and names=True gives data[\"temp\"] field access.",
        "Clean numeric grids are NumPy's home turf; mixed, messy, real-world tables belong to pandas.read_csv — hand off honestly and convert columns back with to_numpy().",
      ],
      quiz: [
        {
          id: "j-02-q1",
          prompt: "Which single argument decides whether a savetxt/loadtxt round trip is exact?",
          options: [
            { text: "delimiter — commas preserve more than spaces", correct: false, feedback: "The separator changes the file's shape, not its fidelity; a comma carries exactly as many digits as a space." },
            { text: "fmt — the format string decides how many digits get written, and unwritten digits are gone forever", correct: true, feedback: "Right: %.2f keeps two decimals, %.8f keeps eight; the round trip is only exact when the format covers the data's real precision." },
            { text: "header — files with headers round-trip better", correct: false, feedback: "The header is a comment line for humans; it never touches the values' precision." },
            { text: "None — text round trips are always exact", correct: false, feedback: "That is true of .npy (Lesson j-01). Text is a transcription, and transcriptions can be lossy." },
          ],
          explanation: "fmt is the fidelity dial of text formats: what it does not write, loadtxt cannot read back.",
        },
        {
          id: "j-02-q2",
          prompt: "A CSV file contains exactly one row of three numbers. What does np.loadtxt return by default, and what fixes it?",
          options: [
            { text: "A (1, 3) array — files always come back 2-D", correct: false, feedback: "loadtxt squeezes singleton rows away; a one-row file and a three-value vector are the same characters." },
            { text: "A (3,) array; ndmin=2 returns the (1, 3) table you meant", correct: true, feedback: "Exactly the trap: same values, collapsed shape. ndmin=2 guarantees the 2-D contract." },
            { text: "A (3, 1) array — it transposes single rows into columns", correct: false, feedback: "No transposition happens; the row collapses to 1-D. (3, 1) would need ndmin=2 on a one-COLUMN file." },
            { text: "An error — loadtxt refuses single-row files", correct: false, feedback: "It loads happily; the surprise is the shape, not a crash — which is what makes it dangerous." },
          ],
          explanation: "loadtxt collapses a one-row file to (n,); ndmin=2 is the one-argument fix whenever downstream code assumes a table.",
        },
        {
          id: "j-02-q3",
          prompt: "np.loadtxt raises ValueError: could not convert string 'temp' to float64. Most likely cause and cure?",
          options: [
            { text: "The file is corrupted; re-export it", correct: false, feedback: "The message is precise, not mysterious: a WORD was found where a number was expected — this is a header being read as data." },
            { text: "A plain (non-#) header line is being parsed as data; skiprows=1 fixes it (or genfromtxt with names=True reads it)", correct: true, feedback: "Correct — the row/column coordinates in the error point straight at the offending line, and skiprows skips it before parsing." },
            { text: "loadtxt needs delimiter=\" \" always", correct: false, feedback: "delimiter choice matters, but the error names a word, not a field-splitting problem." },
            { text: "The dtype must be int", correct: false, feedback: "'temp' is not a number in any dtype; changing types cannot parse a word." },
          ],
          explanation: "Headers that do not start with # are data to loadtxt; skip them (skiprows) or consume them as names (genfromtxt).",
        },
        {
          id: "j-02-q4",
          prompt: "You load a log with genfromtxt(names=True) and no filling_values. Two fields were empty. What do you have?",
          options: [
            { text: "The empty fields became nan, and any mean over that column will be nan too", correct: true, feedback: "Right: gaps default to nan, and nan is contagious — audit with np.isnan before computing, or pass filling_values." },
            { text: "The empty fields became 0.0 automatically", correct: false, feedback: "Substituting a value is a decision genfromtxt leaves to you: filling_values=0 (or your sentinel) does it explicitly." },
            { text: "genfromtxt skipped the rows entirely", correct: false, feedback: "Rows are kept; only the unreadable fields are marked missing. Nothing is dropped without your say-so." },
            { text: "An error — gaps are not allowed", correct: false, feedback: "That is loadtxt's behavior. Tolerance for gaps is genfromtxt's whole reason to exist." },
          ],
          explanation: "genfromtxt turns unparseable fields into nan by default; filling_values is how you take control of what a gap means.",
        },
      ],
    },
    // ------------------------------------------------------------- j-03
    {
      slug: "j-03",
      title: "Performance: Making NumPy Fast Without Guessing",
      minutes: 30,
      summary:
        "The graduation skill: measure honestly (perf_counter, best-of-N, stable booleans), then pull the six levers that actually matter — memory layout, contiguity, avoiding copies, dtype size, batching, and chunking — and know when to leave NumPy altogether.",
      kind: "concept",
      objectives: [
        "Measure code the honest way: time.perf_counter, best-of-N repeats, a correctness gate, and conclusions printed as stable booleans against conservative thresholds — never as raw milliseconds",
        "Explain C vs F memory order and demonstrate when layout matters: your own row-by-row access patterns, not whole-array reductions that adapt",
        "Check an array's contiguity with flags, repair a strided view with np.ascontiguousarray when a copy pays for itself, and prove the difference with a boolean",
        "Avoid copies with in-place operations (a += b) and recognize copy-makers (a = a + b, fancy indexing) using np.shares_memory as the detective",
        "Weigh dtype choices with nbytes arithmetic (float32 halves memory) and process arrays that do not fit in RAM with chunked reductions verified by np.allclose",
      ],
      why: "Somewhere in every NumPy career a script gets slow, and the instinct is to guess: maybe it is the loop, maybe the dtype, maybe the transpose. Guessing wastes days and usually makes the code worse. This lesson installs the professional loop instead: measure one thing honestly, change exactly one lever, measure again. You will build a fair timing harness (best-of-N with a correctness gate), then walk the six levers that cover nearly all real NumPy slowdowns — memory layout, contiguity, needless copies, oversized dtypes, per-element loops, and data that does not fit in memory — each one demonstrated with a verified, stable conclusion rather than a machine-dependent number. The part closes with the honesty to know when NumPy is the wrong tool entirely.",
      blocks: [
        {
          kind: "text",
          text: "Nine parts ago you learned that arrays beat loops. Since then you have probably taken it on faith — and somewhere ahead is the day a script of yours runs slow and you will want to *do something* about it. This lesson is that day's training. The doctrine fits in one sentence: **measure, then change one thing — never the other way around.** Everything else is levers.",
        },
        {
          kind: "text",
          text: "Why so strict about measuring first? Because performance intuitions are mostly wrong, and confidently wrong. The loop you are sure is the bottleneck often is not; the copy you never noticed often is. NumPy gives you a fair laboratory — `time.perf_counter` for the clock, arrays big enough to time stably, and `np.allclose`/`np.array_equal` to prove the fast version computes the same answer. A benchmark without a correctness check is a rumor; every harness in this lesson closes with one.",
        },
        {
          kind: "heading",
          text: "The measurement ritual",
        },
        {
          kind: "text",
          text: "Two clock rules and one honesty rule. First: use `time.perf_counter()` — a monotonic, high-resolution timer made for exactly this (never `time.time()`, which can jump when the system clock adjusts). Second: never trust a single run — garbage collection, cache state and CPU frequency scaling all add noise, so take the **best of N** (the minimum of several repeats is the least contaminated measurement). Third: report conclusions as *booleans against conservative thresholds*, because absolute milliseconds are machine-dependent and do not survive contact with a colleague's laptop.",
        },
        {
          kind: "code",
          title: "The harness every lever in this lesson uses (pattern)",
          lang: "text",
          code: `import numpy as np
import time

def best_of(func, repeats=5):
    """Run func several times; return the FASTEST (least noisy) seconds."""
    times = []
    for _ in range(repeats):
        start = time.perf_counter()
        func()
        times.append(time.perf_counter() - start)
    return min(times)

# illustrative numbers from one laptop -- yours will differ:
#   t_vec  = best_of(lambda: np.sqrt(a))    #   0.8 ms
#   t_loop = best_of(loop_version)          #  92.4 ms
#   print("vectorized faster:", t_vec < t_loop)   # stable on any machine

# The claim worth printing is the BOOLEAN, not the milliseconds.
`,
          outputNote:
            "Display only — the millisecond figures are illustrative from one machine. The pattern is the content: perf_counter, best-of-N, a conservative boolean. Every verified block below follows it and prints conclusions that hold anywhere.",
          explain: [
            "min(times) is the honest choice for best-of-N: the fastest run had the least interference, so it is closest to the code's true cost.",
            "repeats=3 to 5 is plenty for operations that take milliseconds; for microsecond operations, time a LOOP of many calls and divide.",
            "Print booleans like `t_vec * 10 <= t_loop` (at least 10x) rather than raw numbers — thresholds make claims checkable and machine-independent.",
          ],
        },
        {
          kind: "code",
          title: "The ritual, run for real: one op vs one thousand calls",
          code: `import numpy as np
import time

def best_of(func, repeats=5):
    times = []
    for _ in range(repeats):
        start = time.perf_counter()
        func()
        times.append(time.perf_counter() - start)
    return min(times)

a = np.arange(1_000_000, dtype=np.float64)

def loop_sqrt():
    out = []
    for value in a:
        out.append(value ** 0.5)
    return out

t_loop = best_of(loop_sqrt, repeats=3)
t_vec = best_of(lambda: np.sqrt(a))

# the correctness gate: fast means nothing if the answer changed
print("results agree:", np.allclose(np.array(loop_sqrt()), np.sqrt(a)))
print("vectorized at least 10x faster:", t_vec * 10 <= t_loop)
`,
          output: `results agree: True
vectorized at least 10x faster: True`,
          outputNote:
            "Two printed lines, both stable facts: the two methods compute the same values (the gate), and the vectorized form is at least an order of magnitude faster (the conclusion). Your machine's exact ratio will differ; the boolean will not.",
          explain: [
            "This is Lesson e-03's batching discipline, now with a clock on it: one C-level pass over a packed block versus a million Python-level dispatches.",
            "The gate runs the loop once more OUTSIDE the timing — correctness checks are not free, so you keep them out of the measurement.",
            "The threshold (10x) is deliberately conservative: the measured ratio is far larger, so the printed conclusion is robust on any hardware.",
          ],
        },
        {
          kind: "heading",
          text: "Lever 1: memory layout — C order vs F order",
        },
        {
          kind: "text",
          text: "Recall from Part A: NumPy stores 2-D arrays **row-major** (C order) by default — row 0's bytes, then row 1's, all in one block. `np.asfortranarray` builds the same VALUES in the other layout, **column-major** (F order): column 0 first. Neither is faster in general; the question is which layout matches how the array is *walked*. When NumPy controls the walk (whole-array operations), it adapts its iteration to the layout and the difference mostly evaporates — on our build, a plain `sum(axis=1)` on C vs F was a statistical tie, and the winner flipped between runs. But when **your code** fixes the walk — the classic streaming pattern of processing one row at a time — layout suddenly matters enormously:",
        },
        {
          kind: "code",
          title: "Same values, two layouts, one row-by-row walk",
          code: `import numpy as np
import time

def best_of(func, repeats=5):
    times = []
    for _ in range(repeats):
        start = time.perf_counter()
        func()
        times.append(time.perf_counter() - start)
    return min(times)

def row_by_row(m):
    """The streaming pattern: process one row at a time."""
    total = 0.0
    for i in range(m.shape[0]):
        total += m[i].sum()
    return total

a = np.arange(4_000_000, dtype=np.float64).reshape(2000, 2000)  # C order
f = np.asfortranarray(a)                                        # F order

# gate first: both walks must produce the same number
print("same answer both layouts:", abs(row_by_row(a) - row_by_row(f)) < 1e-6)

t_c = best_of(lambda: row_by_row(a))
t_f = best_of(lambda: row_by_row(f))
print("C order at least 2x faster for row walks:", t_c * 2 <= t_f)
`,
          output: `same answer both layouts: True
C order at least 2x faster for row walks: True`,
          outputNote:
            "On our build the row-by-row walk over the C-ordered array was roughly five times faster than the same walk over the F-ordered copy — far above the conservative 2x printed threshold. Each row of an F-order array is strided (one value per distant memory page), and the walk pays for every miss.",
          explain: [
            "In C order, `m[i]` is one contiguous 2,000-value run — cache-friendly. In F order, consecutive values of `m[i]` live 16,000 bytes apart, so every element is a separate memory page visit.",
            "The honest caveat, verified the hard way on our machine: `a.sum(axis=1)` on both layouts was nearly a tie — NumPy's reduction machinery reorders its walk to suit the layout when it can. The lever matters when YOUR code fixes the access order.",
            "Practical rules: arrays you build are C order by default, and that is right for row-wise pipelines (this lesson, and most data work). F order matters when handing buffers to Fortran/BLAS-style libraries; convert at the boundary with asfortranarray, the same way this block did.",
          ],
        },
        {
          kind: "heading",
          text: "Lever 2: keep your arrays contiguous",
        },
        {
          kind: "text",
          text: "Views are free (Part D) — but a view can be *non-contiguous*: `big[::2, ::2]` keeps every second row and column, so its values are scattered across the original block with gaps. Such views still work everywhere, but every operation on them walks memory with a stride, element by element, without the fast contiguous paths. `a.flags[\"C_CONTIGUOUS\"]` tells you the truth, and `np.ascontiguousarray` will pack a strided view into a fresh solid block — copying once so that *every later operation* runs at full speed. When is the copy worth it? Measure:",
        },
        {
          kind: "code",
          title: "A strided view, its packed copy, and the verdict",
          code: `import numpy as np
import time

def best_of(func, repeats=5):
    times = []
    for _ in range(repeats):
        start = time.perf_counter()
        func()
        times.append(time.perf_counter() - start)
    return min(times)

big = np.ones((1000, 2000))
strided = big[::2, ::2]                 # 500 x 1000 view, values scattered
packed = np.ascontiguousarray(strided)  # same values, one solid block

print("strided C-contiguous:", strided.flags["C_CONTIGUOUS"])
print("packed  C-contiguous:", packed.flags["C_CONTIGUOUS"])
print("same values         :", np.array_equal(strided, packed))

t_s = best_of(lambda: strided * 2.0)
t_p = best_of(lambda: packed * 2.0)
print("contiguous at least 1.5x faster here:", t_p * 1.5 <= t_s)
`,
          output: `strided C-contiguous: False
packed  C-contiguous: True
same values         : True
contiguous at least 1.5x faster here: True`,
          outputNote:
            "The strided view honestly reports C_CONTIGUOUS: False; the packed copy reports True with identical values. On our build the elementwise pass over the packed copy ran more than twice as fast — comfortably above the 1.5x threshold printed.",
          explain: [
            "`flags` is a small read-only window onto the array's memory contract; C_CONTIGUOUS means one unbroken block in row-major order.",
            "The copy costs one full pass — so packing pays off when you will touch the data MANY times afterward, and wastes memory if you touch it once. That is a measure-then-decide question, and now you know how.",
            "This is the deep reason fancy indexing (Lesson d-05) returns copies while slicing returns views: fancy indexing's result cannot be described as a simple stride pattern, so NumPy materializes a contiguous block.",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.ascontiguousarray",
          purpose: "Return the input as a contiguous (row-major, C-order) array, copying only when the input is not already contiguous.",
          signature: "np.ascontiguousarray(a, dtype=None, *, like=None)",
          purposeDetail:
            "np.ascontiguousarray is the repair tool of Lever 2. Strided views (slices with steps, transposes of row-major data) work correctly but make every operation walk memory with gaps. This function checks the input's layout and returns the SAME array untouched when it is already contiguous — no copy, no cost — and a packed copy when it is not. Use it when a strided view is about to be touched many times, or when handing data to code that requires a solid block (many C extensions, buffers, file writers). Its sibling np.asfortranarray does the same for column-major order.",
          params: [
            {
              name: "a",
              type: "array_like",
              required: true,
              description: "The input. Lists and scalars are converted; contiguous arrays are returned as-is (ndim becomes at least 1).",
              example: "strided_view",
            },
            {
              name: "dtype",
              type: "dtype",
              description: "Convert to this dtype at the same time — convenient when packing a view AND narrowing float64 to float32 in one pass.",
              example: "dtype=np.float32",
            },
          ],
          returns: {
            type: "ndarray",
            description: "The input's values in a C-contiguous block — the original array itself when it already qualifies (check with np.shares_memory).",
          },
          example: `import numpy as np

big = np.arange(12, dtype=np.float64).reshape(3, 4)
view = big[::2, ::2]                 # 2 x 3 strided view
packed = np.ascontiguousarray(view)  # same values, solid block

print("view   C-contiguous:", view.flags["C_CONTIGUOUS"])
print("packed C-contiguous:", packed.flags["C_CONTIGUOUS"])
print("same values        :", np.array_equal(view, packed))
print("view strides  :", view.strides)
print("packed strides:", packed.strides)

# already-contiguous input comes back UNCOPIED
print("no copy when already packed:", np.shares_memory(packed, np.ascontiguousarray(packed)))
`,
          exampleOutput: `view   C-contiguous: False
packed C-contiguous: True
same values        : True
view strides  : (64, 16)
packed strides: (16, 8)
no copy when already packed: True`,
          commonMistakes: [
            {
              mistake: "Calling ascontiguousarray on every array defensively.",
              why: "On already-contiguous input it is free, but wrapping it around everything trains you to stop thinking about layout — and on strided input it silently doubles your memory.",
              fix: "Check flags[\"C_CONTIGUOUS\"] when curious, and pack only views that will be reused many times.",
            },
            {
              mistake: "Packing a view you will touch exactly once.",
              why: "The copy itself costs a full pass over the data; one subsequent pass gains back at most what the copy spent.",
              fix: "Pack once, use many times — the pattern pays for itself in the second reuse and every one after.",
            },
            {
              mistake: "Expecting the result to share memory with a strided input.",
              why: "A strided view cannot be described by simple strides, so a fresh block is unavoidable.",
              fix: "If you need a view relationship, keep the view; if you need speed on repeated passes, take the copy — you cannot have both.",
            },
          ],
          related: [
            { name: "np.asfortranarray", relation: "The column-major sibling — pack into F order for Fortran/BLAS-style boundaries." },
            { name: "ndarray.flags", relation: "The inspection tool: C_CONTIGUOUS / F_CONTIGUOUS booleans tell you the current layout truth." },
            { name: "np.shares_memory", relation: "Proves whether the packing copied — True means it came back untouched." },
            { name: "np.asarray", relation: "The general converter (no layout guarantee); ascontiguousarray is asarray plus the layout contract." },
          ],
          applications: [
            "Packing a strided selection (every 10th frame, a decimated signal) before a long computation over it",
            "Preparing buffers for C extensions, file writers or memory maps that require one solid block",
            "Converting layout AND dtype in a single pass at a pipeline boundary (dtype=np.float32)",
          ],
          notes:
            "Subclass handling differs from asanyarray: ascontiguousarray may return a base-class ndarray. For everyday numeric data this never matters.",
        },
        {
          kind: "heading",
          text: "Lever 3: avoid copies — in place beats re-allocating",
        },
        {
          kind: "text",
          text: "Every expression like `a = a + b` builds a brand-new block: allocate, fill, drop the old one. The in-place spelling `a += b` writes into the block you already own — same values, no allocation, no garbage. For one line it is nothing; in a loop over a large array it is a real lever (and Lesson e-04's `out=` parameter is the same idea for functions). The subtle part is *knowing* which operations copy — and for that, NumPy ships a detective:",
        },
        {
          kind: "code",
          title: "In place vs re-allocating — and the witness proof",
          code: `import numpy as np
import time

def best_of(func, repeats=5):
    times = []
    for _ in range(repeats):
        start = time.perf_counter()
        func()
        times.append(time.perf_counter() - start)
    return min(times)

n = 5_000_000
b = np.full(n, 2.0)

def in_place():
    x = np.ones(n)
    x += b          # writes into x's block: no allocation

def allocating():
    x = np.ones(n)
    x = x + b       # allocates a new block, then drops the old x

t_i = best_of(in_place)
t_a = best_of(allocating)
print("in-place at least 1.25x faster:", t_i * 1.25 <= t_a)

# the semantics, proven with a witness view
m = np.arange(12).reshape(3, 4)
witness = m[1]          # a VIEW of row 1 (Part D)
m += 100                # in place: the witness sees it
print("witness row after m += 100:", witness.tolist())

# the detective: which indexing styles copy?
print("m[1] is a view  :", np.shares_memory(m, m[1]))
print("m[[1]] is a copy:", not np.shares_memory(m, m[[1]]))
`,
          output: `in-place at least 1.25x faster: True
witness row after m += 100: [104, 105, 106, 107]
m[1] is a view  : True
m[[1]] is a copy: True`,
          outputNote:
            "On our build the in-place version ran about 1.7x faster on five million elements — above the conservative 1.25x threshold. The witness row [104, 105, 106, 107] proves += wrote through the view, and shares_memory flags the fancy-index copy exactly as Lesson d-05 promised.",
          explain: [
            "`+=` on an ndarray is genuinely in-place for same-dtype operands: one pass, no new block. (For mixed dtypes NumPy must still allocate — another reason to keep dtypes consistent.)",
            "The witness trick is the general test for in-place semantics: make a view, run the operation, see whether the view changed. It works on library functions too, not just operators.",
            "`m[[1]]` (fancy indexing, Part D) returns a copy — shares_memory says so. When a loop repeatedly fancy-indexes the same selection, hoist it into a variable once and reuse the copy: fewer allocations, contiguous data (Lever 2, same idea).",
          ],
        },
        {
          kind: "functionDoc",
          name: "np.shares_memory",
          purpose: "Determine whether two arrays overlap in memory — the definitive test for view-vs-copy questions.",
          signature: "np.shares_memory(a, b, /, max_work=None)",
          purposeDetail:
            "np.shares_memory answers the question every experienced NumPy user eventually needs answered exactly: do these two arrays point into the same bytes? If yes, writing through one can change the other (views); if no, they are independent blocks (copies). It is the debugging tool for mysterious mutations (Lesson d-03's detective), and in this lesson it doubles as a performance tool: it tells you whether an operation allocated a fresh block, and whether ascontiguousarray returned your array untouched. In verbose cases (overlapping strided views) exact answers can be expensive; max_work bounds the effort, and 'may share memory' errors mean exactly that.",
          params: [
            {
              name: "a, b",
              type: "ndarray",
              required: true,
              description: "The two arrays to compare. Any dtypes; only their memory ranges and strides matter.",
              example: "m, m[1]",
            },
            {
              name: "max_work",
              type: "int or None",
              description: "Effort limit for the overlap check on complicated strided views. Default None does a cheap check; the special value MAY_SHARE_EXACT demands the full answer.",
              example: "max_work=MAY_SHARE_EXACT",
            },
          ],
          returns: {
            type: "bool",
            description: "True if the arrays may share memory (default check) — treat True as 'assume they do'.",
          },
          example: `import numpy as np

a = np.arange(12).reshape(3, 4)

print("a and a[1] share memory  :", np.shares_memory(a, a[1]))       # basic indexing -> view
print("a and a[[1]] share memory:", np.shares_memory(a, a[[1]]))     # fancy indexing -> copy
print("a and a.T share memory   :", np.shares_memory(a, a.T))        # transpose -> view
print("a and a + 1 share memory :", np.shares_memory(a, a + 1))      # new block -> no

# in-place or not? watch the witness
w = a[0]            # a view of row 0
a += 100            # in place
print("view saw the +=:", w[0] == 100)
`,
          exampleOutput: `a and a[1] share memory  : True
a and a[[1]] share memory: False
a and a.T share memory   : True
a and a + 1 share memory : False
view saw the +=: True`,
          commonMistakes: [
            {
              mistake: "Assuming small operations never copy.",
              why: "reshape, ravel and transpose usually return views — but fancy indexing, +, and astype always build new blocks, at any size.",
              fix: "When independence matters (or copies cost you), let shares_memory arbitrate instead of recalling rules under pressure.",
            },
            {
              mistake: "Reading False as 'arrays are equal' or 'unrelated in value'.",
              why: "shares_memory is about MEMORY, not values. Two arrays can hold identical values and share nothing (a + 1 case above).",
              fix: "For value questions use np.array_equal; for block questions use shares_memory. Different tools, different questions.",
            },
            {
              mistake: "Ignoring a True answer and being surprised by spooky mutation.",
              why: "If b shares memory with a, every write through b is a write into a — the bug that makes slices change their parent (Part D).",
              fix: "Treat True as a warning label: use .copy() to sever the relationship before editing, deliberately.",
            },
          ],
          related: [
            { name: "ndarray.copy", relation: "The fix when shares_memory says True but you need independence." },
            { name: "np.may_share_memory", relation: "The cheaper, coarser cousin — same default behavior as shares_memory's cheap mode." },
            { name: "np.ascontiguousarray", relation: "Combine them: shares_memory proves whether it copied for you." },
            { name: "np.array_equal", relation: "The VALUES question — pairs with shares_memory's MEMORY question." },
          ],
          applications: [
            "Debugging 'my original array changed' mysteries: find which variable aliases it",
            "Performance audits: identifying the hot-loop lines that allocate (fancy indexing, re-allocating operators)",
            "Verifying that an optimization (in-place, out=) really avoided the copy it claimed to",
          ],
          notes:
            "This card completes a promise from Lesson d-03, where the memory detective first appeared without its full reference card. The expensive-overlap corner case (partially overlapping strided views) is rare in practice; the default cheap check answers everyday questions instantly.",
        },
        {
          kind: "heading",
          text: "Lever 4: choose the smallest honest dtype",
        },
        {
          kind: "text",
          text: "Memory is the silent performance factor: an array that fits in cache is fast regardless of everything else, and a grid of float64 is twice as heavy as the same grid in float32. The arithmetic is exact and worth memorizing — `nbytes = size x itemsize` (Part A) — so halving itemsize halves the bill, for free bandwidth. The trade is *precision*: float32 keeps about 7 significant decimal digits, float64 about 16. For sensor data, images and audio, 7 digits is usually plenty; for money, counters and accumulated statistics, it is a silent corruption risk. See both sides in exact numbers:",
        },
        {
          kind: "code",
          title: "The float32 trade: half the bytes, coarser values",
          code: `import numpy as np

grid64 = np.zeros((1000, 1000), dtype=np.float64)   # 8 bytes per value
grid32 = grid64.astype(np.float32)                  # 4 bytes per value

print("float64 nbytes:", grid64.nbytes)
print("float32 nbytes:", grid32.nbytes)
print("memory halved :", grid32.nbytes * 2 == grid64.nbytes)

# the price: fewer significant digits
root64 = np.sqrt(np.float64(2.0))
root32 = np.sqrt(np.float32(2.0))
print("sqrt(2) in float64:", root64)
print("sqrt(2) in float32:", root32)
print("float32 keeps 7 good digits:", np.float32(root64) == root32)
`,
          output: `float64 nbytes: 8000000
float32 nbytes: 4000000
memory halved : True
sqrt(2) in float64: 1.4142135623730951
sqrt(2) in float32: 1.4142135
float32 keeps 7 good digits: True`,
          outputNote:
            "Eight million bytes becomes four million — exactly half — with values that agree to seven significant digits (1.4142135... vs 1.41421356...). The last printed line shows the honest boundary: float32 holds everything float64 told it, rounded to float32's precision.",
          explain: [
            "The nbytes numbers are exact, not timings: 1,000,000 values x 8 bytes = 8,000,000; x 4 = 4,000,000. The memory halving is a mathematical fact, not a measurement.",
            "float64 shows 16 significant digits, float32 shows 7. sqrt(2) needs infinitely many, so both are approximations — float32's is just coarser.",
            "Rules of thumb: media and sensor pipelines thrive on float32; accumulations (long sums, means over millions of values) and money should stay float64, because rounding errors compound. And ints have the same lever: int32 vs int64 halves integer storage.",
          ],
        },
        {
          kind: "heading",
          text: "Lever 5: batch — one array op beats a thousand small ones",
        },
        {
          kind: "text",
          text: "You met this discipline in Lesson e-03; now apply it to a *pipeline-shaped* problem — normalize every row of a matrix. The loop version calls `.mean()`, `.std()` and arithmetic 2,000 times through Python; the batched version computes all row means in one call, all row stds in another, and broadcasts the subtraction (Part G). Same numbers out, radically different amount of interpreter traffic:",
        },
        {
          kind: "code",
          title: "A real-ish pipeline, both ways",
          code: `import numpy as np
import time

def best_of(func, repeats=5):
    times = []
    for _ in range(repeats):
        start = time.perf_counter()
        func()
        times.append(time.perf_counter() - start)
    return min(times)

data = (np.arange(3000 * 60, dtype=np.float64).reshape(3000, 60) % 101) / 7.0

def normalize_rows_loop(m):
    out = np.empty_like(m)
    for i in range(m.shape[0]):
        row = m[i]
        out[i] = (row - row.mean()) / row.std()
    return out

def normalize_rows_batched(m):
    means = m.mean(axis=1, keepdims=True)     # one call, all rows
    stds = m.std(axis=1, keepdims=True)       # one call, all rows
    return (m - means) / stds                 # two broadcasts, done

print("pipelines agree:", np.allclose(normalize_rows_loop(data),
                                      normalize_rows_batched(data)))
t_l = best_of(lambda: normalize_rows_loop(data), repeats=3)
t_v = best_of(lambda: normalize_rows_batched(data), repeats=3)
print("batched pipeline at least 5x faster:", t_v * 5 <= t_l)
`,
          output: `pipelines agree: True
batched pipeline at least 5x faster: True`,
          outputNote:
            "The gate confirms both pipelines produce identical results; on our build the batched one ran an order of magnitude faster — far beyond the 5x threshold printed. Note the shape of the win: not one clever trick, just zero Python-level calls per row.",
          explain: [
            "`axis=1, keepdims=True` (Part F) keeps each row's mean as a (rows, 1) column so the subtraction broadcasts across the row (Part G) — the batching pattern is built from parts you already own.",
            "The loop version is not badly written — it is idiomatic per-row NumPy. It loses purely to call overhead: ~6 Python-level calls per row x 3,000 rows.",
            "When a loop is unavoidable per element (truly custom logic), that is the leave-NumPy signal at the end of this lesson — not a reason to abandon batching everywhere else.",
          ],
        },
        {
          kind: "heading",
          text: "Lever 6: chunk what you cannot hold",
        },
        {
          kind: "text",
          text: "The final lever covers the arrays that will not fit in RAM — or arrive from a memory map (Lesson j-01) or a stream. The pattern is always the same: process a **chunk** at a time, accumulate a small running result, and never materialize the whole thing. And the non-negotiable rule: the chunked answer must match the whole-array answer, verified with `np.allclose` (float summation order differs, so exact equality is not expected — Part B's tolerance thinking):",
        },
        {
          kind: "code",
          title: "Chunked sums that match the whole-array sum",
          code: `import numpy as np

data = (np.arange(10000 * 50, dtype=np.float64).reshape(10000, 50) % 97) / 7.0

running = np.zeros(50)                    # one accumulator per column
n_chunks = 0
for start in range(0, data.shape[0], 1000):
    chunk = data[start:start + 1000]      # a 1000-row view: 400,000 bytes
    running += chunk.sum(axis=0)          # partial column sums
    n_chunks += 1

whole = data.sum(axis=0)                  # the answer in one gulp

print("full array:", data.shape, " bytes:", data.nbytes)
print("chunks:", n_chunks, " chunk bytes:", data[:1000].nbytes)
print("chunked matches whole:", np.allclose(running, whole))
print("worst column gap:", float(np.max(np.abs(running - whole))))
`,
          output: `full array: (10000, 50)  bytes: 4000000
chunks: 10  chunk bytes: 400000
chunked matches whole: True
worst column gap: 8.731149137020111e-11`,
          outputNote:
            "Ten chunks of 400,000 bytes each covered the 4,000,000-byte array, and the accumulated per-column sums agree with the one-shot sums to within 1e-10 — a rounding-order difference, not an error, which is exactly why the check is allclose rather than array_equal.",
          explain: [
            "`running += chunk.sum(axis=0)` is Lever 3 (in-place accumulation) applied to Lever 6 (windows) — the levers compose, which is the point of collecting them.",
            "Each `chunk` is a *view* (slicing never copies), so chunking costs nothing beyond the arithmetic. Swap `data` for a memory map from Lesson j-01 and the identical loop computes on-disk statistics with a few KB of RAM.",
            "allclose with the default tolerances is the professional verification for reordered float sums; the worst-gap print quantifies how tiny the difference actually is.",
          ],
        },
        {
          kind: "arrayViz",
          title: "Chunked accumulation is an axis-0 reduction in disguise",
          mode: "axis",
          name: "chunk",
          caption:
            "Four chunks (rows) x three sensors (columns) of per-chunk column sums. Summing down axis 0 — the operation in the lab above — is exactly what the running accumulator does across chunks: partial sums, added one block at a time. Try mean too: with equal chunk sizes it reproduces the whole-array mean the same way.",
          data: [
            [120.5, 98.25, 111.0],
            [118.0, 101.5, 109.25],
            [122.25, 96.0, 113.5],
            [119.0, 99.75, 110.0],
          ],
          labels: {
            rows: ["chunk 0", "chunk 1", "chunk 2", "chunk 3"],
            cols: ["sensor a", "sensor b", "sensor c"],
          },
          ops: ["sum", "mean"],
        },
        {
          kind: "callout",
          tone: "info",
          title: "When to leave NumPy (and that is fine)",
          text: "NumPy's home is dense numeric grids — it is the best tool in Python there. Outside that home, hand off honestly: messy tabular data (mixed types, joins, group-bys) belongs to pandas, whose columns hand straight back with to_numpy(). Graph and network algorithms belong to graph libraries — arrays are grids, not graphs. And a per-element kernel that cannot be expressed as array operations at all is the signal to compile it (numba, Cython) rather than force it. The skill is not making NumPy do everything; it is knowing its border and crossing it deliberately.",
        },
        {
          kind: "steps",
          title: "The graduation checklist",
          items: [
            "**Shape and dtype first.** After every load, build or handoff: `print(a.shape, a.dtype)` — nine parts of habits, one reflex.",
            "**Views vs copies known.** Slices are views; fancy indexing and arithmetic make copies — and np.shares_memory settles any doubt in one call.",
            "**Measure before optimizing.** perf_counter, best-of-N, a correctness gate, conclusions as booleans — never a guess and never one timing.",
            "**One lever at a time.** Layout, contiguity, copies, dtype, batching, chunking — change one, re-measure, keep what the numbers justify.",
            "**Files chosen deliberately.** Binary (.npy/.npz) for exactness between stages; text only where humans read, with fmt matched to the data's precision (Lesson j-02).",
            "**Determinism recorded.** Seeds logged (Part I), dtypes documented, and every pipeline ending in a verification print that would catch a regression.",
          ],
        },
        {
          kind: "tryIt",
          title: "Run your own honest benchmark",
          task: "Press Run to time a per-element Python loop against one vectorized operation with the best-of-3 harness. Then experiment: (1) change 500_000 to 50_000 and watch the ratio shrink; (2) swap the loop body for value * 1.01 (a cheaper operation) and see whether the gap is really about the loop, not the math; (3) add a correctness gate comparing the two results with np.allclose before trusting anything.",
          code: `import numpy as np
import time

def best_of(func, repeats=3):
    times = []
    for _ in range(repeats):
        start = time.perf_counter()
        func()
        times.append(time.perf_counter() - start)
    return min(times)

a = np.arange(500_000, dtype=np.float64)

def with_loop():
    out = []
    for value in a:
        out.append(value * 1.01)
    return out

t_loop = best_of(with_loop)
t_vec = best_of(lambda: a * 1.01)

print("loop    best of 3:", round(t_loop * 1000, 2), "ms")
print("vector  best of 3:", round(t_vec * 1000, 2), "ms")
print("vectorized faster:", t_vec < t_loop)
`,
          hint: "The millisecond numbers are YOUR machine's — that is the point: run it, believe your own measurements, and trust the boolean line. A gate line (np.allclose) is what separates a benchmark from a rumor.",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: "One breath summary",
          text: "Measure with perf_counter and best-of-N, gate every fast version with a correctness check, and print booleans with conservative thresholds. Then pull one lever at a time: match layout to your walk, keep hot data contiguous, prefer += to re-allocating, choose the smallest honest dtype, batch instead of looping, and chunk what does not fit. And know NumPy's border — crossing to pandas or a compiler on purpose is a skill, not a defeat.",
        },
      ],
      terms: [
        { term: "time.perf_counter", definition: "The monotonic high-resolution timer for benchmarking; paired with best-of-N repeats it gives stable, comparable measurements." },
        { term: "Best-of-N", definition: "Timing an operation several times and taking the minimum — the run with least interference from garbage collection, cache state or CPU scaling." },
        { term: "C order / F order", definition: "Row-major vs column-major memory layout. NumPy defaults to C order; asfortranarray converts; the fast layout is the one matching your access pattern." },
        { term: "Contiguity (C_CONTIGUOUS)", definition: "Whether an array's values occupy one unbroken memory block. Strided views break it; np.ascontiguousarray repairs it with one deliberate copy." },
        { term: "In-place operation", definition: "An operation like a += b that writes into the existing block instead of allocating a fresh result — no allocation, and visible through any view of a." },
        { term: "Chunking", definition: "Processing a big array window by window with a small running accumulator, verified against the whole-array result with np.allclose." },
      ],
      mistakes: [
        {
          mistake: "Optimizing from a guess instead of a measurement.",
          why: "Performance intuition is unreliable: the suspected loop is often innocent while an unnoticed copy or dtype does the damage. Changes made without a baseline cannot even be evaluated.",
          fix: "Build the harness first (perf_counter, best-of-N, correctness gate), measure the real workload, and change one lever at a time.",
        },
        {
          mistake: "Trusting a single timing run.",
          why: "One measurement includes garbage collection, cold caches and CPU frequency scaling — the same code can time 2x differently seconds apart.",
          fix: "Best of several runs (min of N), and report conclusions as booleans against conservative thresholds instead of raw milliseconds.",
        },
        {
          mistake: "Printing raw timings in shared reports or tests.",
          why: "Milliseconds are machine-dependent facts; a number like 92.4 ms is meaningless on another laptop and flaky on your own under load.",
          fix: "Print stable claims: booleans with thresholds (vectorized at least 10x faster: True) and deterministic facts (nbytes, allclose).",
        },
        {
          mistake: "Calling np.ascontiguousarray (or .copy()) on everything, always.",
          why: "Packing a strided view allocates a full new block; if you touch the data once, the copy costs more than it saves and doubles memory.",
          fix: "Pack views you will reuse many times; leave single-use views alone; let flags[\"C_CONTIGUOUS\"] and shares_memory tell you the truth.",
        },
        {
          mistake: "Reaching for float32 to save memory on accumulations or money.",
          why: "float32 carries ~7 significant digits; long sums and financial arithmetic compound rounding error until it is visible in results.",
          fix: "float32 for bulk media/sensor storage and bandwidth; float64 for accumulation, statistics and anything with a decimal point that must balance.",
        },
      ],
      takeaways: [
        "The doctrine: measure (perf_counter, best-of-N, correctness gate), then change ONE lever — and report conclusions as stable booleans against conservative thresholds, never raw timings.",
        "Layout matters when YOUR code fixes the walk: row-by-row patterns want C order (~5x on our build); whole-array reductions adapt to either layout.",
        "Strided views break contiguity (flags say so); np.ascontiguousarray buys it back with one copy that pays for itself on reuse.",
        "a += b writes into the existing block while a = a + b allocates; np.shares_memory is the detective for which operations copy (fancy indexing always does).",
        "float32 halves nbytes exactly (4,000,000 vs 8,000,000 on a (1000, 1000) grid) at ~7 significant digits — a deliberate trade, not a free lunch.",
        "Chunked processing (window + running accumulator, verified with allclose) makes arrays bigger than RAM computable — and composes with every other lever.",
      ],
      quiz: [
        {
          id: "j-03-q1",
          prompt: "Your NumPy script is slow. What is the FIRST professional move?",
          options: [
            { text: "Rewrite the loops in vectorized form — that is always the bottleneck", correct: false, feedback: "Often true, sometimes not — and changing code without a baseline means you cannot even tell whether you helped." },
            { text: "Build a fair measurement (perf_counter, best-of-N, correctness gate) and find where the time actually goes", correct: true, feedback: "Correct: measure, then change one lever. The measurement IS the optimization step — everything after it is just choosing which lever the numbers justify." },
            { text: "Convert every array to float32 immediately", correct: false, feedback: "A dtype lever with real precision costs — applied blindly it can corrupt results without fixing the actual bottleneck." },
            { text: "Add more RAM or a faster CPU", correct: false, feedback: "Sometimes the eventual answer, but you would be buying hardware for code you have not yet understood." },
          ],
          explanation: "Measurement first, one change at a time: the two halves of the performance doctrine.",
        },
        {
          id: "j-03-q2",
          prompt: "You time a.sum(axis=1) on an array and on its asfortranarray copy, and see barely any difference. What did you learn?",
          options: [
            { text: "Memory layout never matters in NumPy", correct: false, feedback: "Too broad — this one operation adapts its iteration to the layout; other access patterns do not have that freedom." },
            { text: "Whole-array reductions adapt their walk to the layout; layout matters most when YOUR code fixes the access order (like row-by-row streaming)", correct: true, feedback: "Exactly the honest conclusion from this lesson's lever 1: reductions tie, forced walks (row by row on C vs F) differ dramatically." },
            { text: "asfortranarray silently returns the same array", correct: false, feedback: "It genuinely rebuilt the data column-major (shares_memory would say so) — the reduction adapted, not the conversion." },
            { text: "The timing harness is broken", correct: false, feedback: "A tie is a legitimate, reproducible result — one of the most valuable things a harness can tell you." },
          ],
          explanation: "NumPy's whole-array machinery reorders iteration to suit the layout; your own loops cannot. Measure which situation you are in.",
        },
        {
          id: "j-03-q3",
          prompt: "What does `a += b` avoid that `a = a + b` pays for?",
          options: [
            { text: "Nothing — they compile to the same code", correct: false, feedback: "They differ in allocation: + must build a fresh result block before the old one is dropped; += reuses a's block." },
            { text: "Allocating a whole new block for the result (and garbage-collecting the old one)", correct: true, feedback: "Right — same values, but += is a single in-place write, which any view of a can witness." },
            { text: "The need for broadcasting rules", correct: false, feedback: "Both forms broadcast identically (Part G); the difference is purely where the result lives." },
            { text: "Overflow errors on large arrays", correct: false, feedback: "dtype overflow behavior is the same in both spellings — allocation is the difference." },
          ],
          explanation: "In-place operations write into the existing block: no allocation, no copy — the third lever, provable with a witness view or np.shares_memory.",
        },
        {
          id: "j-03-q4",
          prompt: "Why does the lesson verify chunked sums with np.allclose instead of np.array_equal?",
          options: [
            { text: "allclose is faster to compute than array_equal", correct: false, feedback: "Both are instant at this size; the choice is about correctness semantics, not speed." },
            { text: "Because chunked processing is approximate by design and small errors are acceptable", correct: false, feedback: "No — the VALUES are exact; it is the ORDER of float additions that differs, changing the last bits of the rounding." },
            { text: "Because summing floats in a different order gives last-bit differences, so exact equality is the wrong test for reordered sums", correct: true, feedback: "Exactly: (a + b) + c and a + (b + c) can differ in the final bit. allclose with tolerances is the honest check for 'same answer up to float ordering'." },
            { text: "Because array_equal does not work on 1-D results", correct: false, feedback: "array_equal works on any shapes — it is simply too strict a question for reordered float sums." },
          ],
          explanation: "Chunking changes summation order; float addition is not associative, so allclose — not bit equality — is the professional verification.",
        },
      ],
    },
  ],
  // ------------------------------------------------------------------
  // Part J exercises (12: b1-b4 beginner, i1-i4 intermediate, a1-a4
  // advanced). Solutions run under the real /tmp filesystem; each one
  // creates whatever it later reads, and prints only values, dtypes,
  // shapes and equality booleans — never file sizes, timestamps or
  // directory listings.
  // ------------------------------------------------------------------
  exercises: [
    {
      id: "j-b1",
      tier: "beginner",
      title: "Your first round trip",
      prompt:
        "The calibration grid `calibration = (np.arange(8) * 25).astype(np.int16).reshape(2, 4)` must survive a trip to disk and back. Save it to `/tmp/jb1-calibration.npy` with np.save, load it with np.load, then print three lines: the restored array, its dtype and shape on one line, and an np.array_equal check against the original. The int16 dtype is the point — the file remembers it so you do not have to.",
      hint: "np.save(path, a) then np.load(path). Print the dtype and shape from the RESTORED array, and compare with np.array_equal(restored, calibration).",
      starter: `import numpy as np

calibration = (np.arange(8) * 25).astype(np.int16).reshape(2, 4)

# TODO: save to /tmp/jb1-calibration.npy, load it back, then print:
# the restored array, its dtype + shape, and an array_equal check
`,
      solution: `import numpy as np

calibration = (np.arange(8) * 25).astype(np.int16).reshape(2, 4)
np.save("/tmp/jb1-calibration.npy", calibration)
back = np.load("/tmp/jb1-calibration.npy")

print(back)
print("dtype:", back.dtype, "shape:", back.shape)
print("identical:", np.array_equal(back, calibration))
`,
      expectedOutput: `[[  0  25  50  75]
 [100 125 150 175]]
dtype: int16 shape: (2, 4)
identical: True`,
      concepts: ["np.save", "np.load", "round trip", "dtype preservation"],
    },
    {
      id: "j-b2",
      tier: "beginner",
      title: "A CSV a human can eyeball",
      prompt:
        "Write a small temperature table to human-readable CSV and prove it comes back intact. With `temps = np.array([[21.500, 19.250, 18.000], [22.125, 20.500, 17.750]])`, save it to `/tmp/jb2.csv` with delimiter=\",\" and fmt=\"%.3f\", load it back with np.loadtxt, and print: the restored array, its dtype and shape on one line, and an np.array_equal check. Every value has at most three decimals, so three decimals are enough — the round trip should print True.",
      hint: "np.savetxt(path, temps, delimiter=\",\", fmt=\"%.3f\") then np.loadtxt(path, delimiter=\",\"). The values were chosen to be exactly representable in three decimals.",
      starter: `import numpy as np

temps = np.array([[21.500, 19.250, 18.000],
                  [22.125, 20.500, 17.750]])

# TODO: save as CSV (delimiter=",", fmt="%.3f"), load it back, then
# print the array, its dtype + shape, and an exact-equality check
`,
      solution: `import numpy as np

temps = np.array([[21.500, 19.250, 18.000],
                  [22.125, 20.500, 17.750]])
np.savetxt("/tmp/jb2.csv", temps, delimiter=",", fmt="%.3f")
back = np.loadtxt("/tmp/jb2.csv", delimiter=",")

print(back)
print("dtype:", back.dtype, "shape:", back.shape)
print("round trip exact:", np.array_equal(back, temps))
`,
      expectedOutput: `[[21.5   19.25  18.   ]
 [22.125 20.5   17.75 ]]
dtype: float64 shape: (2, 3)
round trip exact: True`,
      concepts: ["np.savetxt", "np.loadtxt", "fmt", "round trip"],
    },
    {
      id: "j-b3",
      tier: "beginner",
      title: "Pack a dataset",
      prompt:
        "A dataset is more than one array. Pack `readings = np.linspace(10.0, 20.0, 6)` and `names = np.array([\"alpha\", \"beta\", \"gamma\", \"alpha\", \"beta\", \"gamma\"])` into ONE file at `/tmp/jb3.npz` using np.savez with keyword names, load it back, and print five lines: the container type (type(pack).__name__), each member's dtype and shape, and an np.array_equal round-trip check for each member. Two arrays, one file, zero confusion about which is which.",
      hint: "np.savez(path, readings=readings, names=names) — the keywords become the archive keys. Read members back with pack[\"readings\"] and pack[\"names\"].",
      starter: `import numpy as np

readings = np.linspace(10.0, 20.0, 6)
names = np.array(["alpha", "beta", "gamma", "alpha", "beta", "gamma"])

# TODO: pack both arrays into /tmp/jb3.npz by keyword, load the pack,
# then print the container type, each member's dtype + shape, and an
# array_equal check for each member
`,
      solution: `import numpy as np

readings = np.linspace(10.0, 20.0, 6)
names = np.array(["alpha", "beta", "gamma", "alpha", "beta", "gamma"])

np.savez("/tmp/jb3.npz", readings=readings, names=names)
pack = np.load("/tmp/jb3.npz")

print("type:", type(pack).__name__)
print("readings:", pack["readings"].dtype, pack["readings"].shape)
print("names   :", pack["names"].dtype, pack["names"].shape)
print("readings identical:", np.array_equal(pack["readings"], readings))
print("names identical   :", np.array_equal(pack["names"], names))
`,
      expectedOutput: `type: NpzFile
readings: float64 (6,)
names   : <U5 (6,)
readings identical: True
names identical   : True`,
      concepts: ["np.savez", "np.load", "NpzFile", "keyword names"],
    },
    {
      id: "j-b4",
      tier: "beginner",
      title: "The memory bill, before you pay it",
      prompt:
        "Before a (1000, 1000) grid ever exists in a pipeline, someone should have done this arithmetic. Build `grid64 = np.zeros((1000, 1000), dtype=np.float64)` and `grid32 = np.zeros((1000, 1000), dtype=np.float32)`, then print three lines: the float64 dtype and nbytes, the float32 dtype and nbytes, and a boolean proving float32 uses exactly half the memory. No timing, no guessing — just the deterministic facts every dtype decision starts from.",
      hint: "The attribute is .nbytes on each array. For the boolean: grid32.nbytes * 2 == grid64.nbytes.",
      starter: `import numpy as np

grid64 = np.zeros((1000, 1000), dtype=np.float64)
grid32 = np.zeros((1000, 1000), dtype=np.float32)

# TODO: print each grid's dtype and nbytes, then a boolean proving
# float32 costs exactly half the bytes
`,
      solution: `import numpy as np

grid64 = np.zeros((1000, 1000), dtype=np.float64)
grid32 = np.zeros((1000, 1000), dtype=np.float32)

print("float64:", grid64.dtype, grid64.nbytes, "bytes")
print("float32:", grid32.dtype, grid32.nbytes, "bytes")
print("float32 halves the memory:", grid32.nbytes * 2 == grid64.nbytes)
`,
      expectedOutput: `float64: float64 8000000 bytes
float32: float32 4000000 bytes
float32 halves the memory: True`,
      concepts: ["nbytes", "dtype choice", "memory budgeting"],
    },
    {
      id: "j-i1",
      tier: "intermediate",
      title: "The precision cliff, both edges",
      prompt:
        "Prove the precision cliff with `constants = np.array([3.14159265, 2.71828183, 0.12345678])`. Save it to `/tmp/ji1-coarse.csv` with fmt=\"%.2f\" and (separately) to `/tmp/ji1-fine.csv` with fmt=\"%.8f\"; load each back with np.loadtxt. Print five lines: the original values, the coarse values, an array_equal check for coarse (expect False), the fine values, and an array_equal check for fine (expect True). The format string — not the file — decides what survives.",
      hint: "One-dimensional arrays save as one value per line; loadtxt reads that back as 1-D. The values have exactly eight decimals, so %.8f writes every digit and the round trip is exact.",
      starter: `import numpy as np

constants = np.array([3.14159265, 2.71828183, 0.12345678])

# TODO: save with fmt="%.2f", reload, print values + equality check
# TODO: save with fmt="%.8f", reload, print values + equality check
`,
      solution: `import numpy as np

constants = np.array([3.14159265, 2.71828183, 0.12345678])

np.savetxt("/tmp/ji1-coarse.csv", constants, fmt="%.2f")
coarse = np.loadtxt("/tmp/ji1-coarse.csv")

np.savetxt("/tmp/ji1-fine.csv", constants, fmt="%.8f")
fine = np.loadtxt("/tmp/ji1-fine.csv")

print("original values:", constants)
print("coarse values  :", coarse)
print("coarse exact   :", np.array_equal(coarse, constants))
print("fine values    :", fine)
print("fine exact     :", np.array_equal(fine, constants))
`,
      expectedOutput: `original values: [3.14159265 2.71828183 0.12345678]
coarse values  : [3.14 2.72 0.12]
coarse exact   : False
fine values    : [3.14159265 2.71828183 0.12345678]
fine exact     : True`,
      concepts: ["fmt string", "precision loss", "savetxt", "loadtxt"],
    },
    {
      id: "j-i2",
      tier: "intermediate",
      title: "Skip the header, pick the columns",
      prompt:
        "A monitoring CSV arrives with a comment header and three columns, but your analysis needs only the first and the last. The starter writes `/tmp/ji2.csv` from `table = 15.0 + ((np.arange(12).reshape(4, 3) * 17) % 40) / 4.0` with a header line. Read back ONLY columns 0 and 2 (skipping the header) using np.loadtxt with skiprows and usecols, then print: the picked array's shape, its values, and an np.array_equal check against `table[:, [0, 2]]`. One call, exactly the slice of the data you wanted.",
      hint: "np.loadtxt(path, delimiter=\",\", skiprows=1, usecols=(0, 2)). The header line begins with '# ' but you still need skiprows=1 to move past it; usecols takes column indexes, and the result is (4, 2).",
      starter: `import numpy as np

table = 15.0 + ((np.arange(12).reshape(4, 3) * 17) % 40) / 4.0
np.savetxt("/tmp/ji2.csv", table, delimiter=",", fmt="%.3f",
           header="temp_c,wind_kmh,rh_pct")

# TODO: load ONLY columns 0 and 2, skipping the header line, then print
# the picked shape, the values, and a check against table[:, [0, 2]]
`,
      solution: `import numpy as np

table = 15.0 + ((np.arange(12).reshape(4, 3) * 17) % 40) / 4.0
np.savetxt("/tmp/ji2.csv", table, delimiter=",", fmt="%.3f",
           header="temp_c,wind_kmh,rh_pct")

picked = np.loadtxt("/tmp/ji2.csv", delimiter=",", skiprows=1, usecols=(0, 2))

print("picked shape:", picked.shape)
print(picked)
print("matches original columns:", np.array_equal(picked, table[:, [0, 2]]))
`,
      expectedOutput: `picked shape: (4, 2)
[[15.   23.5 ]
 [17.75 16.25]
 [20.5  19.  ]
 [23.25 21.75]]
matches original columns: True`,
      concepts: ["np.loadtxt", "skiprows", "usecols", "column selection"],
    },
    {
      id: "j-i3",
      tier: "intermediate",
      title: "Mind the gap",
      prompt:
        "Real logs have holes. The starter writes `/tmp/ji3.csv` — a three-column sensor log where the temp on row 2, the pressure on row 3 and the humidity on row 4 are simply missing (empty fields). Read the SAME file twice with np.genfromtxt (delimiter=\",\", skip_header=1): once with gaps left alone and once with filling_values=-1.0. Print: the shape and dtype, the gap-filled-none array, the number of nan cells (int of np.isnan(...).sum()), and the filled array. Two policies, one file, zero crashes.",
      hint: "genfromtxt turns anything it cannot parse into nan by default; filling_values=-1.0 swaps in your sentinel instead. skip_header=1 moves past the column-name line.",
      starter: `import numpy as np

with open("/tmp/ji3.csv", "w") as f:
    f.write("temp_c,pressure,humidity\\n"
            "21.4,101.3,55.0\\n"
            ",100.9,48.0\\n"
            "19.8,,61.5\\n"
            "22.1,101.1,\\n")

# TODO: read the file twice with np.genfromtxt (delimiter=",",
# skip_header=1) -- once with gaps left alone, once with
# filling_values=-1.0 -- and print both arrays, the shape + dtype,
# and how many cells went missing
`,
      solution: `import numpy as np

with open("/tmp/ji3.csv", "w") as f:
    f.write("temp_c,pressure,humidity\\n"
            "21.4,101.3,55.0\\n"
            ",100.9,48.0\\n"
            "19.8,,61.5\\n"
            "22.1,101.1,\\n")

gaps = np.genfromtxt("/tmp/ji3.csv", delimiter=",", skip_header=1)
filled = np.genfromtxt("/tmp/ji3.csv", delimiter=",", skip_header=1,
                       filling_values=-1.0)

print("shape:", gaps.shape, "dtype:", gaps.dtype)
print("gaps left alone :")
print(gaps)
print("missing cells   :", int(np.isnan(gaps).sum()))
print("gaps filled by -1:")
print(filled)
`,
      expectedOutput: `shape: (4, 3) dtype: float64
gaps left alone :
[[ 21.4 101.3  55. ]
 [  nan 100.9  48. ]
 [ 19.8   nan  61.5]
 [ 22.1 101.1   nan]]
missing cells   : 3
gaps filled by -1:
[[ 21.4 101.3  55. ]
 [ -1.  100.9  48. ]
 [ 19.8  -1.   61.5]
 [ 22.1 101.1  -1. ]]`,
      concepts: ["np.genfromtxt", "missing values", "filling_values", "nan"],
    },
    {
      id: "j-i4",
      tier: "intermediate",
      title: "A window into a big file",
      prompt:
        "Compute on an on-disk array without loading all of it. The starter saves a (600, 300) float64 grid to `/tmp/ji4.npy` (each row r holds r + 0.001*c at column c) and deletes the in-memory copy. Load the file with np.load(..., mmap_mode=\"r\"), take rows 595:600 as a window, and print three lines: the container type with its full shape and dtype, whether the window is still a memory map (isinstance of np.memmap), and the window's row sums rounded to 3 decimals. (Memory mapping needs a real file system — if the in-page sandbox refuses this one, run it on your own machine.)",
      hint: "mm = np.load(path, mmap_mode=\"r\") gives a memmap; slicing it gives a memmap view of just those rows; only those pages are read. Row sums: window.sum(axis=1), printed through np.round(..., 3).",
      starter: `import numpy as np

grid = np.arange(600)[:, None] + np.arange(300) * 0.001
np.save("/tmp/ji4.npy", grid)
del grid

# TODO: load the file with mmap_mode="r", take rows 595:600 as a
# window, and print the container type + full shape + dtype, whether
# the window is still a memory map, and its row sums rounded to 3
`,
      solution: `import numpy as np

grid = np.arange(600)[:, None] + np.arange(300) * 0.001
np.save("/tmp/ji4.npy", grid)
del grid

mm = np.load("/tmp/ji4.npy", mmap_mode="r")
window = mm[595:600]

print("type:", type(mm).__name__, "shape:", mm.shape, "dtype:", mm.dtype)
print("window is still memory-mapped:", isinstance(window, np.memmap))
print("window row sums (rounded):")
print(np.round(window.sum(axis=1), 3))
`,
      expectedOutput: `type: memmap shape: (600, 300) dtype: float64
window is still memory-mapped: True
window row sums (rounded):
[178544.85 178844.85 179144.85 179444.85 179744.85]`,
      concepts: ["mmap_mode", "np.memmap", "slicing", "out-of-core"],
    },
    {
      id: "j-a1",
      tier: "advanced",
      title: "The compression trade, proven honestly",
      prompt:
        "Show when np.savez_compressed earns its keep — with stable facts, not byte counts. Build `smooth = np.ones((300, 300))` with `smooth[::8, ::8] = 7.5` (mostly-identical values: ideal compression food), save it BOTH ways — np.savez to `/tmp/ja1-plain.npz` and np.savez_compressed to `/tmp/ja1-zipped.npz` — then, using os.path.getsize WITHOUT ever printing the sizes, print: the smaller-archive boolean, an np.array_equal round-trip check for each archive's member, and the compressed member's dtype and shape. Compression is a space-for-CPU trade, never a precision trade — your output proves the second half.",
      hint: "import os.path, then plain_bytes = os.path.getsize(...) and zipped_bytes = os.path.getsize(...); compare them with < but print only the boolean. Reload both archives and array_equal their members against smooth.",
      starter: `import numpy as np
import os.path

smooth = np.ones((300, 300))
smooth[::8, ::8] = 7.5

# TODO: save the SAME grid two ways (np.savez and np.savez_compressed,
# different /tmp paths), compare the file sizes WITHOUT printing them,
# reload both members, and print: the size boolean, an array_equal
# check per archive, and the compressed member's dtype + shape
`,
      solution: `import numpy as np
import os.path

smooth = np.ones((300, 300))
smooth[::8, ::8] = 7.5

np.savez("/tmp/ja1-plain.npz", smooth=smooth)
np.savez_compressed("/tmp/ja1-zipped.npz", smooth=smooth)

plain_bytes = os.path.getsize("/tmp/ja1-plain.npz")
zipped_bytes = os.path.getsize("/tmp/ja1-zipped.npz")

back_plain = np.load("/tmp/ja1-plain.npz")["smooth"]
back_zipped = np.load("/tmp/ja1-zipped.npz")["smooth"]

print("compressed is smaller:", zipped_bytes < plain_bytes)
print("plain values exact   :", np.array_equal(back_plain, smooth))
print("zipped values exact  :", np.array_equal(back_zipped, smooth))
print("member dtype/shape   :", back_zipped.dtype, back_zipped.shape)
`,
      expectedOutput: `compressed is smaller: True
plain values exact   : True
zipped values exact  : True
member dtype/shape   : float64 (300, 300)`,
      concepts: ["np.savez_compressed", "file size comparison", "lossless round trip"],
    },
    {
      id: "j-a2",
      tier: "advanced",
      title: "Lazy by design",
      prompt:
        "Prove that an .npz is loaded lazily — from the outside, with no timings. Store `temps = np.linspace(0.0, 9.0, 10)` and `flags = np.array([1, 0, 1, 1, 0, 1, 0, 0, 1, 1], dtype=np.uint8)` in ONE compressed archive at `/tmp/ja2.npz`, load it, then print six lines: the container type, whether two accesses of the SAME key give equal values (np.array_equal), whether they give the SAME OBJECT (Python's is), the type of a materialized member, and an np.array_equal round-trip check for each of the two members. The is line is the lazy proof: each access re-reads the member from the archive, so it builds a fresh array every time.",
      hint: "first = pack[\"temps\"]; second = pack[\"temps\"] — then compare with np.array_equal(first, second) for values and first is second for identity. Two reads, two distinct arrays: that is laziness made visible.",
      starter: `import numpy as np

temps = np.linspace(0.0, 9.0, 10)
flags = np.array([1, 0, 1, 1, 0, 1, 0, 0, 1, 1], dtype=np.uint8)

# TODO: store both arrays in ONE compressed archive, load it, and
# prove it is lazy: access the same member twice, then compare the two
# results with == (values) and with is (object identity)
`,
      solution: `import numpy as np

temps = np.linspace(0.0, 9.0, 10)
flags = np.array([1, 0, 1, 1, 0, 1, 0, 0, 1, 1], dtype=np.uint8)
np.savez_compressed("/tmp/ja2.npz", temps=temps, flags=flags)

pack = np.load("/tmp/ja2.npz")
print("container type:", type(pack).__name__)

first = pack["temps"]
second = pack["temps"]

print("same values from two accesses:", np.array_equal(first, second))
print("same object from two accesses:", first is second)
print("materialized member is a     :", type(first).__name__)
print("temps round trip exact       :", np.array_equal(first, temps))
print("flags round trip exact       :", np.array_equal(pack["flags"], flags))
`,
      expectedOutput: `container type: NpzFile
same values from two accesses: True
same object from two accesses: False
materialized member is a     : ndarray
temps round trip exact       : True
flags round trip exact       : True`,
      concepts: ["NpzFile", "lazy loading", "np.savez_compressed", "object identity"],
    },
    {
      id: "j-a3",
      tier: "advanced",
      title: "Views, copies, and the detective",
      prompt:
        "One script, three proofs about where results live. Start from `a = np.arange(24).reshape(6, 4)` and `strided = a[::2]` (rows 0, 2, 4 — a view with gaps). Print: strided's C-contiguity flag, the same flag after `packed = np.ascontiguousarray(strided)`, and np.shares_memory(strided, packed). Then take `witness = a[2]` (a view), run `a += 100` in place, and print whether witness[0] == 108. Finally take `fancy = a[[0, 1]]` (fancy indexing — always a copy), run `a += 1000`, and print whether fancy[0, 0] == 100 AND whether witness[0] == 1108. Eight lines: the flags tell you the layout, the witness tells you in-place means in-place, the frozen copy tells you fancy indexing copies.",
      hint: 'Flags come from arr.flags["C_CONTIGUOUS"] (True/False). The witness is a VIEW of a\'s row 2 (values 8..11), so every += flows through it; fancy indexing hands you a COPY that never hears about later updates.',
      starter: `import numpy as np

a = np.arange(24).reshape(6, 4)
strided = a[::2]          # rows 0, 2, 4 -- a view with gaps

# TODO: print strided's C-contiguity flag, pack it with
# np.ascontiguousarray, print that flag and np.shares_memory, then run
# two in-place += waves -- one watched by a witness view, one survived
# by a fancy-index copy
`,
      solution: `import numpy as np

a = np.arange(24).reshape(6, 4)
strided = a[::2]
packed = np.ascontiguousarray(strided)

print("strided view contiguous:", strided.flags["C_CONTIGUOUS"])
print("packed copy contiguous :", packed.flags["C_CONTIGUOUS"])
print("packed shares memory   :", np.shares_memory(strided, packed))

witness = a[2]
a += 100
print("witness saw the update :", witness[0] == 108)

fancy = a[[0, 1]]
a += 1000
print("fancy copy stayed cold :", fancy[0, 0] == 100)
print("witness saw both waves :", witness[0] == 1108)
`,
      expectedOutput: `strided view contiguous: False
packed copy contiguous : True
packed shares memory   : False
witness saw the update : True
fancy copy stayed cold : True
witness saw both waves : True`,
      concepts: ["contiguity flags", "np.ascontiguousarray", "in-place operations", "np.shares_memory", "fancy-index copies"],
    },
    {
      id: "j-a4",
      tier: "advanced",
      title: "Chunked, and provably the same",
      prompt:
        "Process a (10000, 50) array in 1000-row chunks and prove the chunked result equals the whole-array result. With `data = np.arange(10000 * 50, dtype=np.float64).reshape(10000, 50)`, compute `whole = data.sum(axis=0)` directly, then accumulate `chunked` — a np.zeros(50) running sum — over ten 1000-row windows with `chunked += data[start:start + 1000].sum(axis=0)`. Print: both shapes on one line, the np.allclose verdict, the max absolute difference as a float, and the first five column sums. The professional habit: a fast path is only fast if allclose says it is still right.",
      hint: "for start in range(0, 10000, 1000): window = data[start:start + 1000]. The max difference comes from float(np.max(np.abs(chunked - whole))) — on this integer-valued data it is 0.0, and allclose confirms it.",
      starter: `import numpy as np

data = np.arange(10000 * 50, dtype=np.float64).reshape(10000, 50)
whole = data.sum(axis=0)

# TODO: compute the same column sums in 1000-row chunks with a running
# accumulator (np.zeros(50) + +=), then print both shapes, an allclose
# check, the max absolute difference, and the first five column sums
`,
      solution: `import numpy as np

data = np.arange(10000 * 50, dtype=np.float64).reshape(10000, 50)
whole = data.sum(axis=0)

chunked = np.zeros(50)
for start in range(0, 10000, 1000):
    chunked += data[start:start + 1000].sum(axis=0)

print("whole shape :", whole.shape, "chunked shape:", chunked.shape)
print("allclose    :", np.allclose(chunked, whole))
print("max abs diff:", float(np.max(np.abs(chunked - whole))))
print("first five column sums:", whole[:5])
`,
      expectedOutput: `whole shape : (50,) chunked shape: (50,)
allclose    : True
max abs diff: 0.0
first five column sums: [2.49975e+09 2.49976e+09 2.49977e+09 2.49978e+09 2.49979e+09]`,
      concepts: ["chunked processing", "running accumulator", "np.allclose", "verification"],
    },
  ],

  // ------------------------------------------------------------------
  // Part J assessment (8 questions, 80% to pass)
  // ------------------------------------------------------------------
  assessment: [
    {
      id: "j-as-1",
      prompt: "Physically, what is inside a .npy file?",
      options: [
        { text: "A short header describing the dtype and shape, followed by the array's raw bytes exactly as they sit in memory", correct: true, feedback: "Right — a photograph of the array's block, not a re-typed copy of its values. That is why loading needs no parsing and loses nothing." },
        { text: "The values written as decimal text, one per line, with a shape comment on the first line", correct: false, feedback: "That describes a text transcription (Lesson j-02 territory) — and it could not preserve dtypes like int16 or non-contiguous layouts." },
        { text: "A zip archive able to hold many arrays, each under a name you choose", correct: false, feedback: "That is .npz (np.savez). A .npy holds exactly ONE array — the whole point of the split." },
        { text: "A pickle of the array plus the NumPy version needed to rebuild it", correct: false, feedback: "No pickling is involved — and np.load's allow_pickle=False default exists precisely so untrusted files stay away from pickles." },
      ],
      explanation: "One .npy = one small header (dtype, shape) + the raw data block. Load reads the header, reinterprets the bytes, done.",
    },
    {
      id: "j-as-2",
      prompt: "np.load on a .npz file hands you an NpzFile. What is that object doing?",
      options: [
        { text: "It reads the archive's table of contents and materializes each member only when you actually access its key", correct: true, feedback: "Correct — lazy by design: an archive of ten arrays where you use two costs you two reads. Each access builds a fresh array." },
        { text: "It immediately decompresses and reads every member into a dictionary of arrays", correct: false, feedback: "That eager behavior would defeat the whole design for big archives — only the members you touch are ever read." },
        { text: "It is just an open file handle; you must call a .read() method yourself to get arrays", correct: false, feedback: "No manual reading: indexing pack[\"temps\"] IS the read — it returns a complete ndarray." },
        { text: "It extracts all members into temporary files on disk and returns their names", correct: false, feedback: "Nothing is extracted anywhere — members stream straight out of the archive into memory, on demand." },
      ],
      explanation: "NpzFile = a lazy directory of the archive's members: keys are listed upfront, bytes are read per access.",
    },
    {
      id: "j-as-3",
      prompt: "When does np.savez_compressed earn its keep over plain np.savez?",
      options: [
        { text: "When the members have structure — smooth, sparse or repeated values — and file size or transfer time matters; the values still come back exactly", correct: true, feedback: "Exactly: compression is a space-for-CPU trade, never a precision trade. Structure compresses; noise does not." },
        { text: "Always — compressed archives are smaller AND load faster", correct: false, feedback: "Half right at best: noise-like members barely shrink, and decompressing costs CPU on every load. Measure on YOUR data." },
        { text: "When you can tolerate losing a few low-order digits per value to save space", correct: false, feedback: "That is text-format thinking (Lesson j-02). Zip compression is lossless — array_equal proves the values return identical." },
        { text: "Only for string arrays; numeric members cannot be compressed", correct: false, feedback: "Any member's bytes can be compressed — a mostly-ones float64 grid shrinks dramatically, as the lesson proved with a boolean." },
      ],
      explanation: "Compress data with structure when bytes matter; skip it for noise-like members or when every millisecond of load time counts.",
    },
    {
      id: "j-as-4",
      prompt: "On an 8 GB machine you map a 40 GB .npy with np.load(..., mmap_mode=\"r\"), then call mm.mean(). What actually happens?",
      options: [
        { text: "The whole-array reduction touches every page, so the entire file ends up flowing through RAM — compute per-window instead", correct: true, feedback: "Right — and it is the classic memmap trap: mean() needs every value, so the mapping buys nothing here. Windowed reductions (Lesson j-03's chunking) are the fix." },
        { text: "The mean is computed from the file header, without reading the data", correct: false, feedback: "Headers store dtype and shape only — no statistics. Any real answer needs the values." },
        { text: "NumPy raises an error because the array is bigger than RAM", correct: false, feedback: "Mapping is exactly the tool for bigger-than-RAM arrays; it is whole-array operations on them that turn into the trap." },
        { text: "It silently returns the mean of whichever pages happen to be in the OS cache", correct: false, feedback: "NumPy never invents partial answers — the reduction walks the whole array, page by page, however long that takes." },
      ],
      explanation: "A whole-array operation on a memmap reads every page eventually — the RAM win comes only from touching slices and windows deliberately.",
    },
    {
      id: "j-as-5",
      prompt: "Your data holds values like 21.537 and 0.125 — never more than three decimal places. Which savetxt fmt keeps an exact round trip?",
      options: [
        { text: "fmt=\"%.3f\" — three decimals are enough for values that only ever have three decimals", correct: true, feedback: "Right: match fmt to the data's real precision. Every digit written is a digit loadtxt can parse back into the identical float64." },
        { text: "fmt=\"%.2f\" — loadtxt restores the missing digit on the way back in", correct: false, feedback: "Nothing restores a digit that was never written: 21.537 becomes 21.54 and array_equal reports False. The cliff is one-way." },
        { text: "fmt=\"%d\" — integers are the most compact exact format", correct: false, feedback: "Catastrophic, not compact: %d truncates to whole numbers, so 21.537 becomes 21 and the data is destroyed by choice." },
        { text: "It does not matter — loadtxt always reconstructs full float64 precision", correct: false, feedback: "loadtxt can only parse the characters that exist in the file. What fmt did not write, nobody can recover." },
      ],
      explanation: "The format string decides fidelity: as many decimals as the data truly has, and the text round trip is exact.",
    },
    {
      id: "j-as-6",
      prompt: "A CSV has one '#' comment header line and 5 columns; its data section is a single row of numbers. You need columns 1 and 4 back as a (1, 2) array. The call is:",
      options: [
        { text: "np.loadtxt(path, delimiter=\",\", skiprows=1, usecols=(1, 4), ndmin=2)", correct: true, feedback: "All three guards in one call: skip the header, pick the columns, and force 2-D so a one-row file still comes back as a grid." },
        { text: "np.loadtxt(path, delimiter=\",\", usecols=(1, 4), ndmin=2)", correct: false, feedback: "Missing skiprows=1: loadtxt chokes on the header text ('could not convert string to float') before usecols ever matters." },
        { text: "np.loadtxt(path, delimiter=\",\", skiprows=1, usecols=(1, 4))", correct: false, feedback: "So close — but a one-row file loads as a flat (2,) array without ndmin=2. That is the classic single-row shape trap." },
        { text: "np.loadtxt(path, delimiter=\",\", skiprows=1, usecols=(2, 5), ndmin=2)", correct: false, feedback: "Off by one on both columns: skiprows removes a LINE, not a column — the indexes you pass to usecols are the file's real column numbers." },
      ],
      explanation: "skiprows moves past lines, usecols picks columns by index, ndmin=2 rescues single-row files. Three arguments, three different jobs.",
    },
    {
      id: "j-as-7",
      prompt: "A teammate's CSV has a plain (uncommented) header row, empty cells, dates, and quoted text with commas inside. The honest call is:",
      options: [
        { text: "Hand it to pandas.read_csv — this file has crossed from 'grid with quirks' into 'messy document' territory, and that is pandas' home ground", correct: true, feedback: "Correct — and it is a skill, not a defeat: knowing NumPy's border is part of using NumPy well. Parse, clean, then hand NumPy tidy arrays." },
        { text: "np.genfromtxt with the right missing_values and names — it exists for exactly this", correct: false, feedback: "genfromtxt tolerates gaps and named columns, but quoted commas and date columns are beyond what it was built for. 'Exists for messy files' has a limit." },
        { text: "np.loadtxt with skiprows=1 and usecols to drop the messy columns", correct: false, feedback: "loadtxt demands a perfect numeric rectangle; the empty cells alone already break it, let alone the quoted text." },
        { text: "Open the file in a text editor and fix every gap by hand before any library touches it", correct: false, feedback: "It 'works' once — and silently rots the moment the file regenerates. Pipelines need reproducible readers, not hand edits." },
      ],
      explanation: "NumPy's readers want grids. Genuinely messy documents belong to pandas — the professional move is the handoff, not the fight.",
    },
    {
      id: "j-as-8",
      prompt: "A (4000, 4000) float64 array must stay in RAM and be reused dozens of times; about 7 significant digits of precision is acceptable. Which lever pays best?",
      options: [
        { text: "Cast it to float32 — nbytes drops from 128 MB to exactly 64 MB, and every one of those reuses benefits", correct: true, feedback: "Right — the dtype lever: half the bytes, deterministically, at the stated precision cost. This is arithmetic you can do before writing any code." },
        { text: "Wrap it in np.ascontiguousarray — a packed block is always smaller", correct: false, feedback: "Packing repairs layout, not size: the same values in the same dtype occupy exactly the same bytes." },
        { text: "Process it in 100-row chunks — chunking shrinks any array's memory", correct: false, feedback: "Chunking limits how much is RESIDENT at once; the whole array still exists and must fit somewhere. Here it must stay fully in RAM by requirement." },
        { text: "Replace a = a + b with a += b everywhere possible", correct: false, feedback: "A good copy-avoiding habit, but it trims temporary allocations — the 128 MB array itself is untouched." },
      ],
      explanation: "When the data must stay resident and precision allows it, the dtype choice is the honest lever: float32 halves nbytes exactly.",
    },
  ],

  // ------------------------------------------------------------------
  // Part J mini project
  // ------------------------------------------------------------------
  project: {
    title: "The Array Warehouse",
    brief:
      "Build a tiny data-persistence toolkit that ships a dataset safely through every format this part taught. You will assemble a deterministic dataset pack (a measurements matrix, a labels vector, and metadata scalars), store it as ONE compressed .npz archive with a version key, reload it and verify every member with np.array_equal, export a human-readable CSV preview with savetxt — three decimals — and re-read it to face the loss you chose, then write a (500, 500) array to disk and compute its column means in 100-row chunks through a memory map, proving they match the in-memory means with np.allclose. The program closes with a warehouse receipt: what was stored, every dtype and shape, and every verification boolean. This is the persistence layer of a real pipeline in miniature — and every claim it prints is machine-checkable. (The memory-map step needs a real file system; if the in-page sandbox refuses it, run the project on your own computer — every other step works anywhere.)",
    requirements: [
      "A deterministic dataset pack built from arithmetic only (no randomness): a (120, 4) float64 measurements matrix, a (120,) labels array cycling four station names, a version scalar np.array(3) and a calibration scalar np.array(21.5)",
      "ONE np.savez_compressed call storing all four members under keyword names — version included — at /tmp/warehouse.npz",
      "Reload the archive and verify EVERY member with np.array_equal: one boolean per member, plus an honest 'verified: 4 / 4' style count",
      "A CSV preview of the measurements with np.savetxt (delimiter=\",\", fmt=\"%.3f\", a header naming the four columns), re-read with np.loadtxt and skiprows, printing whether the round trip is exact AND the largest absolute loss as a float",
      "A (500, 500) float64 'big shelf' saved to /tmp/warehouse-big.npy and reopened read-only with np.load(..., mmap_mode=\"r\")",
      "Chunked column means: loop over the shelf in 100-row windows, accumulate a running column sum (np.zeros(500) plus +=), divide by 500, and print an np.allclose check against the in-memory column means of a freshly rebuilt copy",
      "A final warehouse receipt printing each member's dtype and shape with its verification boolean — values, dtypes, shapes and booleans only; never file sizes, timestamps or directory listings",
    ],
    steps: [
      "Write the pack builder: measurements from arange arithmetic (values with MORE than three decimals, so the CSV loss later is real), labels cycling north/south/east/west, and the two metadata scalars. Sanity-print measurements.shape and labels.dtype before any file exists.",
      "Store the whole pack in one np.savez_compressed call with keyword names, then reload it and print the four np.array_equal booleans. All four must be True before you continue — this is the correctness gate of the whole project.",
      "Export the CSV preview with fmt=\"%.3f\" and a header line, re-read it with loadtxt and skiprows=1, then print the exact-round-trip boolean and the max absolute loss (np.max(np.abs(preview - measurements))). In a comment, say why the loss is real by construction.",
      "Save the (500, 500) shelf (the starter's shelf_values() formula) to /tmp/warehouse-big.npy, reopen it with mmap_mode=\"r\", and confirm a 100-row window is still a memmap with isinstance — you are reading the file, not a copy in RAM.",
      "Run the chunked loop: five 100-row windows, a running column sum accumulated with +=, then divide by 500. Rebuild the values in memory and compare means with np.allclose — print the boolean.",
      "Assemble the receipt: one line per archive member showing dtype, shape and its verification boolean, the verified count, the CSV loss line, and the shelf's dtype/shape with the allclose verdict.",
      "Run it end to end. Every boolean should print True except the CSV exactness line — if anything else says False, fix the pipeline before shipping. A receipt that lies is worse than no receipt.",
    ],
    starter: `import numpy as np

# =====================================================================
# THE ARRAY WAREHOUSE -- build a dataset pack, store it three ways
# (compressed .npz archive, CSV preview, big .npy shelf read through
# a memory map), and print a receipt proving every round trip.
# =====================================================================

def shelf_values():
    """The (500, 500) shelf contents -- deterministic, rebuilt on demand."""
    return (np.arange(250_000).reshape(500, 500) % 997) / 8.0

# --- 1) the dataset pack: deterministic, no randomness ---------------
n = 120
measurements = 15.0 + (np.arange(n * 4).reshape(n, 4) * 7) % 90 / 61.0
labels = np.array(["north", "south", "east", "west"] * (n // 4))
version = np.array(3)          # schema version: bump when the pack changes meaning
calibration = np.array(21.5)   # rig temperature when the pack was recorded

# --- 2) the archive: ONE compressed .npz holding the whole pack ------
np.savez_compressed("/tmp/warehouse.npz",
                    measurements=measurements, labels=labels,
                    version=version, calibration=calibration)

# --- 3) reload and verify every member -------------------------------
pack = np.load("/tmp/warehouse.npz")
print("measurements ok:", np.array_equal(pack["measurements"], measurements))
# TODO: print the same round-trip check for labels, version and calibration

# --- 4) the CSV preview: 3 decimals, and the honest loss report ------
np.savetxt("/tmp/warehouse-preview.csv", measurements, delimiter=",", fmt="%.3f",
           header="s0,s1,s2,s3")
preview = np.loadtxt("/tmp/warehouse-preview.csv", delimiter=",", skiprows=1)
print("csv round trip exact:", np.array_equal(preview, measurements))
print("csv max abs loss    :", 0.0)   # TODO: replace 0.0 with the real max loss

# --- 5) the big shelf: on disk, read through a memory map ------------
np.save("/tmp/warehouse-big.npy", shelf_values())
shelf = np.load("/tmp/warehouse-big.npy", mmap_mode="r")
print("shelf:", shelf.dtype, shelf.shape)

chunked_means = np.zeros(500)
# TODO: loop over the shelf in 100-row windows, accumulate column sums
#       into chunked_means with +=, then divide by 500 for the means

reference = np.zeros(500)   # TODO: the true column means, from a fresh
                            # in-memory rebuild (shelf_values().mean(axis=0))
print("chunked means match:", np.allclose(chunked_means, reference))

# --- 6) the receipt ---------------------------------------------------
# TODO: print every member's dtype and shape with its verification
#       boolean, then the verified count (e.g. 4 / 4)
`,
    concepts: [
      "np.savez_compressed",
      "np.load",
      "np.array_equal",
      "np.savetxt",
      "np.loadtxt",
      "mmap_mode",
      "chunked reductions",
      "np.allclose",
    ],
    extension:
      "Add a schema check: store the pack's expected dtypes inside the archive itself (a small 'schema' string array listing member names and dtypes) and verify each member against it on load, before any math. Then bump version to 4, change one dtype on purpose, and watch your own check refuse the pack — a warehouse that guards its own doors.",
  },
};
