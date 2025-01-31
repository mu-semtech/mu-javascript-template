# Regular rsync command using options optimized to copy local files or files
# from mounted volumes in a Docker container
# Additional rsync options can be passed as argument
function docker-rsync() {
  # Common use:
  #  SOURCE_DIR=$1
  #  TARGET_DIR=$2
  #
  # As a reminder if SOURCE_DIR ends with '/', it copies the files from SOURCE_DIR into
  # TARGET_DIR. If it doesn't end with '/', it copies SOURCE_DIR itself into TARGET_DIR.

  # Used rsync options:
  # -a: archive, -H: preserve hard links, -A: preserve ACL, -W: no delta transfer
  # -X: extended attributes, -S: efficient sparse files
  # --numeric-ids: use uuid by number instead of by name
  # --info: silent output
  # --no-compress: no compression algorithm
  rsync -aHAWXS --numeric-ids --info= --no-compress "$@"
}
