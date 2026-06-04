import os


def read_logs(path, offset=0, max_lines=50):

    logs = []
    new_offset = offset

    if not os.path.exists(path):

        print(f"[WARNING] Log path does not exist: {path}")

        return [], offset
    
    # CASE 1 — If path is a file
    if os.path.isfile(path):

        with open(path, "r") as f:

            f.seek(offset)

            for _ in range(max_lines):

                line = f.readline()

                if not line:
                    break

                logs.append(line.strip())

            new_offset = f.tell()

        return logs, new_offset

    # CASE 2 — If path is a directory
    elif os.path.isdir(path):

        for filename in os.listdir(path):

            if filename.endswith(".log"):

                file_path = os.path.join(path, filename)

                with open(file_path, "r") as f:

                    for line in f.readlines()[-max_lines:]:

                        logs.append(f"{filename}: {line.strip()}")

        return logs, 0

    else:

        raise Exception(f"Invalid path: {path}")